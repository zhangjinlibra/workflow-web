<template>
  <a-drawer
    v-if="visible"
    :append-to-body="true"
    :width="540"
    :visible="visible"
    :closable="false"
    @cancel="closeDrawer()"
    @ok="saveCc()"
    ok-text="保存">
    <template #title>
      <EditableText :value="flowNodeConfig.name" @change="(v) => (flowNodeConfig.name = v)" />
    </template>

    <!-- 抄送人 -->
    <div class="item-content-editor">
      <div class="content-wrap">
        <div class="item-content">
          <!-- 抄送人列表 -->
          <div class="item-wrap approver">
            <div class="approver-list">
              <div class="approver-wrapper" v-for="(item, idx) in flowNodeConfig.ccs || []">
                <div class="header">
                  <span>抄送人{{ idx + 1 }}</span>
                  <icon-delete :style="{ fontSize: '18px' }" @click="rmCC(item)" v-if="flowNodeConfig.ccs.length > 1" />
                </div>
                <div class="main-content">
                  <a-radio-group class="radio-group" v-model="item.ccType" @change="onCcTypeChanged(item)">
                    <a-grid :cols="3" :colGap="30" :rowGap="10">
                      <a-grid-item><a-radio :value="0">发起人本人</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="1">上级</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="2">部门负责人</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="3">角色</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="4">指定成员</a-radio></a-grid-item>
                      <!-- <a-grid-item><a-radio :value="6">发起人自选</a-radio></a-grid-item> -->
                    </a-grid>
                  </a-radio-group>
                </div>
                <div class="sub-content" v-if="![0, 6].includes(item.ccType)">
                  <div class="sub-content-top-line"></div>
                  <template v-if="item.ccType == 1">
                    <p class="bold">请选择上级</p>
                    <a-form-item label="发起人的">
                      <a-select placeholder="请选择上级" v-model="item.layer">
                        <template #header>
                          <div class="switch-container">
                            <div class="select-tip">从直属上级向上选择</div>
                            <a-link @click="switchLayerType(item)">
                              <template #icon><icon-swap /></template>{{ item.layerType == 0 ? "切为最高上级向下" : "切为直属上级向上" }}
                            </a-link>
                          </div>
                        </template>
                        <a-option v-for="i in 20" :value="i - 1">
                          <template v-if="item.layerType == 0">{{ i == 1 ? "直属上级" : "直属上级加 " + (i - 1) + " 级" }}</template>
                          <template v-else>{{ i == 1 ? "最高上级" : "最高上级减 " + (i - 1) + " 级" }}</template>
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </template>
                  <template v-else-if="item.ccType == 2">
                    <p class="bold">请选择部门负责人</p>
                    <a-form-item label="发起人的">
                      <a-select placeholder="请选择部门负责人" v-model="item.layer">
                        <template #header>
                          <div class="switch-container">
                            <div class="select-tip">从直属部门负责人向上选择</div>
                            <a-link @click="switchLayerType(item)">
                              <template #icon><icon-swap /></template>{{ item.layerType == 0 ? "切为最高部门向下" : "切为直属部门向上" }}
                            </a-link>
                          </div>
                        </template>
                        <a-option v-for="i in 20" :value="i - 1">
                          <template v-if="item.layerType == 0">
                            {{ i == 1 ? "直属部门负责人" : "直属部门负责人加 " + (i - 1) + " 级" }}
                          </template>
                          <template v-else>{{ i == 1 ? "最高部门负责人" : "最高部门负责人减 " + (i - 1) + " 级" }}</template>
                        </a-option>
                      </a-select>
                    </a-form-item>
                  </template>
                  <template v-else-if="item.ccType == 3">
                    <p class="bold">选择角色</p>
                    <a-form-item tooltip="请选择角色" label="组织角色">
                      <a-select multiple placeholder="请选择角色" v-model="item.roles">
                        <a-option v-for="role in roles" :value="role.id" :label="role.name"></a-option>
                      </a-select>
                    </a-form-item>
                  </template>
                  <template v-else-if="item.ccType == 4">
                    <p class="bold">添加成员<span>（不能超过 25 人）</span></p>
                    <div class="assignee-box">
                      <a-button size="small" @click="onAssigneeClick(item)"><icon-plus /></a-button>
                      <span class="assignee-list">
                        <a-tag v-for="userId in item.assignees">{{ getUserById(userId).name }}</a-tag>
                      </span>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- 添加审核人按钮 -->
            <div class="add-operator">
              <a-link @click="addCC()">
                <template #icon><icon-plus /></template>添加抄送人
              </a-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <OrganChooseBox
      v-if="showChooseOrgan"
      v-model:visible="showChooseOrgan"
      v-model:selected="selectedAssignee.assignees"
      :hidden-dept="true"
      :hidden-role="true" />
  </a-drawer>
</template>
<script setup>
import { computed, onBeforeMount, ref, toRaw, watch } from "vue";
import { useFlowStore, useOrganStore } from "@/stores/index";
import ArrayUtil from "../common/ArrayUtil";
import Snowflake from "../common/Snowflake";
import OrganChooseBox from "../dialog/OrganChooseBox.vue";
import { IconDelete, IconSwap, IconPlus } from "@arco-design/web-vue/es/icon";
import EditableText from "@/components/common/EditableText.vue";

let flowStore = useFlowStore();
let { roles: allRoles, getUserById } = useOrganStore();
let { showCopyerDrawer, setCopyerConfig } = flowStore;
let isCopyerDrawerOpened = computed(() => flowStore.isCopyerDrawerOpened);
let copyerConfig0 = computed(() => flowStore.copyerConfig0);
let visible = computed({
  get: () => isCopyerDrawerOpened.value,
  set: () => closeDrawer(),
});

let _uid = ref(0);
let flowNodeConfig = ref({});

// 切换上级和部门负责人的人事层级关系
const switchLayerType = (cc) => {
  cc.layerType = cc.layerType == 0 ? 1 : 0;
};

// 审批人选择指定成员
let showChooseOrgan = ref(false); // 是否显示指定成员对话框
let selectedAssignee = ref({}); // 当前选中的单个审批人设置
const onAssigneeClick = (item) => {
  selectedAssignee.value = item;
  showChooseOrgan.value = true;
};

// 抄送人类型变更事件
const onCcTypeChanged = (cc) => {
  console.log("抄送人类型切换时", cc);
  let { ccType } = cc;
  if (ccType == 0) {
    delete cc.layerType;
    delete cc.layer;
    delete cc.roles;
    delete cc.assignees;
  } else if ([1, 2].includes(ccType)) {
    cc.layer = 0;
    cc.layerType = 0;
    delete cc.roles;
    delete cc.assignees;
  } else if (ccType == 3) {
    delete cc.layerType;
    delete cc.layer;
    delete cc.assignees;
  } else if (ccType == 4) {
    cc.assignees = [];
    delete cc.layerType;
    delete cc.layer;
    delete cc.roles;
  }
};

const addCC = () => {
  if (!flowNodeConfig.value.ccs) flowNodeConfig.value.ccs = [];
  flowNodeConfig.value.ccs.push({
    rid: Snowflake.generate(),
    ccType: 0,
  });
};

const rmCC = (cc) => {
  ArrayUtil.remove(flowNodeConfig.value.ccs, "rid", cc.rid);
};

let roles = ref([]);
const loadRoles = () => (roles.value = allRoles);

watch(copyerConfig0, (val) => {
  flowNodeConfig.value = val.value;
  console.log(flowNodeConfig);
  _uid = val.id;
});

const saveCc = () => {
  setCopyerConfig({
    value: toRaw(flowNodeConfig.value),
    flag: true,
    id: _uid,
  });
  closeDrawer();
};

const closeDrawer = () => {
  showCopyerDrawer(false);
};

onBeforeMount(() => {
  loadRoles();
});
</script>

<style lang="less">
.item-content-editor {
  margin-top: 8px;

  .approver-list {
    .approver-wrapper {
      border: 1px solid #e4e5e7;
      border-radius: 6px;
      overflow: hidden;

      + .approver-wrapper {
        margin-top: 6px;
      }

      .header {
        padding: 0 16px;
        background: #f5f6f7;
        height: 36px;
        line-height: 36px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          color: #1f2329;
          font-weight: 600;
        }

        .arco-icon {
          cursor: pointer;
          &:hover {
            color: #3370ff;
          }
        }
      }

      .sub-content {
        padding: 0 16px 10px;

        .sub-content-top-line {
          border-top: 1px solid #dee0e3;
        }

        p {
          padding-top: 10px;
          color: #1f2329;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .arco-form-item {
          margin-bottom: 0;
        }

        .assignee-box {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .assignee-list {
            flex: 1;
            margin-left: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;

            .arco-tag {
              height: 28px;
            }
          }
        }
      }

      .radio-group {
        padding: 10px 16px;
        width: 100%;

        .arco-radio {
          margin-right: 2px;
        }
      }
    }
  }

  .add-operator {
    margin-top: 8px;
  }

  .item-wrap {
    + .item-wrap {
      margin-top: 24px;
    }
  }
}

.switch-container {
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin: 0 12px;

  .select-tip {
    color: #646a73;
  }
}
</style>
