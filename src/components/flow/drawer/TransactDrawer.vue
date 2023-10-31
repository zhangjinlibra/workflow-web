<template>
  <a-drawer
    v-if="visible"
    :append-to-body="true"
    :width="540"
    :visible="visible"
    :closable="false"
    @cancel="close()"
    @ok="saveTransactor()"
    ok-text="保存">
    <template #title>
      <EditableText :value="flowNodeConfig.name" @change="(v) => (flowNodeConfig.name = v)" />
    </template>

    <div class="transact-drawer__content">
      <!-- 办理人设置 -->
      <div class="transact-setting-tip-wrapper">
        <div class="content-wrap">
          <div class="item-content">
            <div class="item-wrap tip">
              <div class="item-key-wrapper">
                <p class="item-key">办理人设置</p>
              </div>
              <div class="more-info">
                <p>当流程中某个节点不需要审批，但需要对审批单进行业务办理时，可设置办理人节点，场景如财务打款、处理盖章等。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 办理人选择界面 -->
      <div class="transact-editor-tab-wrapper" v-if="flowNodeConfig.approvalType == 0">
        <a-radio-group type="button" v-model="viewEditorType" size="large">
          <a-radio :value="0">设置办理人</a-radio>
          <!-- <a-radio value="right">表单权限</a-radio> -->
          <a-radio :value="1">操作权限</a-radio>
        </a-radio-group>

        <!-- 设置办理人 -->
        <div class="item-content-editor" v-if="viewEditorType == 0">
          <div class="content-wrap">
            <div class="item-content">
              <!-- 办理人列表 -->
              <div class="item-wrap approver">
                <div class="transactor-list">
                  <div class="transactor-wrapper" v-for="(item, idx) in flowNodeConfig.transactors">
                    <div class="header">
                      <span>办理人{{ idx + 1 }}</span>
                      <icon-delete :style="{ fontSize: '18px' }" @click="delTransactor(item)" v-if="flowNodeConfig.transactors.length > 1" />
                    </div>
                    <div class="main-content">
                      <a-radio-group class="radio-group" v-model="item.transactorType" @change="onTransactorTypeChanged(item)">
                        <a-grid :cols="3" :colGap="0" :rowGap="10">
                          <a-grid-item><a-radio :value="ASSIGNEE.SELF">发起人本人</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="ASSIGNEE.SUPERIOR">上级</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="ASSIGNEE.DEPARTMENT_LEADER">部门负责人</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="ASSIGNEE.ROLE">角色</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="ASSIGNEE.ASSIGNEE">指定成员</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="ASSIGNEE.INITIATOR_CHOICE" :disabled="haveMultiNode">发起人自选</a-radio></a-grid-item>
                        </a-grid>
                      </a-radio-group>
                    </div>
                    <div class="sub-content" v-if="![ASSIGNEE.SELF, ASSIGNEE.INITIATOR_CHOICE].includes(item.transactorType)">
                      <div class="sub-content-top-line"></div>
                      <template v-if="item.transactorType == ASSIGNEE.SUPERIOR">
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
                      <template v-else-if="item.transactorType == ASSIGNEE.DEPARTMENT_LEADER">
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
                      <template v-else-if="item.transactorType == ASSIGNEE.ROLE">
                        <p class="bold">选择角色</p>
                        <a-form-item tooltip="请选择角色" label="组织角色">
                          <a-select multiple placeholder="请选择角色" v-model="item.roles">
                            <a-option v-for="role in allRoles" :value="role.id" :label="role.name"></a-option>
                          </a-select>
                        </a-form-item>
                      </template>
                      <template v-else-if="item.transactorType == ASSIGNEE.ASSIGNEE">
                        <p class="bold">添加成员<span>（不能超过 25 人）</span></p>
                        <div class="assignee-box">
                          <a-button size="small" @click="onAssigneeClick(item)"><icon-plus /></a-button>
                          <span class="assignee-list">
                            <a-tag v-for="userId in item.assignees">{{ getUserById(userId).name }}</a-tag>
                          </span>
                          <OrganChooseBox
                            v-if="showChooseTransactor"
                            v-model:visible="showChooseTransactor"
                            v-model:selected="selectedAssignee.assignees"
                            :hidden-dept="true"
                            :hidden-role="true" />
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- 添加办理人按钮 -->
                <div class="add-operator">
                  <a-link @click="addTransactor()" v-if="!onlyOneNode">
                    <template #icon><icon-plus /></template>添加办理人
                  </a-link>
                </div>
              </div>

              <!-- 会签、或签、序签 -->
              <div class="item-wrap sign-type" v-if="haveMultiNode || isInitiatorChoiceOrRoleOrAssignee">
                <div class="item-key-wrapper">
                  <div class="item-key">多人办理时采用的处理方式</div>
                </div>
                <div class="item-content">
                  <a-radio-group direction="vertical" v-model="flowNodeConfig.multiInstanceApprovalType">
                    <a-radio :value="1">会签（需所有办理人同意）</a-radio>
                    <a-radio :value="2">或签（一名办理人同意即可）</a-radio>
                    <a-radio :value="3" v-if="isSameTransactorType">依次办理（按顺序依次办理）</a-radio>
                  </a-radio-group>
                </div>
              </div>

              <!-- 办理人为空时 -->
              <div class="item-wrap approver-null">
                <div class="item-key-wrapper">
                  <div class="item-key">办理人为空时</div>
                </div>
                <div class="item-content">
                  <a-radio-group v-model="flowNodeConfig.flowNodeNoAuditorType" @change="onNoTransactorTypeChanged">
                    <a-radio :value="1">指定人员办理</a-radio>
                    <a-radio :value="2">转交给审批管理员</a-radio>
                  </a-radio-group>

                  <div class="approver-null-select-box">
                    <a-form-item label="指定成员" v-if="flowNodeConfig.flowNodeNoAuditorType == 1">
                      <a-select placeholder="请选择成员" v-model="flowNodeConfig.flowNodeNoAuditorAssignee">
                        <a-option v-for="user in allUsers" :value="user.id" :label="user.name"></a-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item label="审批管理员" v-else-if="flowNodeConfig.flowNodeNoAuditorType == 2">
                      <a-select placeholder="请选择管理员" v-model="flowNodeConfig.flowNodeAuditAdmin">
                        <a-option v-for="userId in workFlowDef.flowAdminIds" :value="userId" :label="getUserById(userId).name" />
                      </a-select>
                    </a-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 设置操作权限 -->
        <div class="item-content-auth" v-else-if="viewEditorType == 1">
          <div class="content-wrap">
            <div class="item-content">
              <div class="item-wrap auth-list">
                <a-checkbox class="auth-item" v-model="flowNodeConfig.assignable" :value="1">允许转交</a-checkbox>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, ref, toRaw, watch } from "vue";
import { useFlowStore, useOrganStore } from "@/stores/index";
import ArrayUtil from "../common/ArrayUtil";
import Snowflake from "../common/Snowflake";
import OrganChooseBox from "../dialog/OrganChooseBox.vue";
import { IconDelete, IconSwap, IconPlus } from "@arco-design/web-vue/es/icon";
import EditableText from "@/components/common/EditableText.vue";
import { ASSIGNEE } from "../common/FlowConstant";

let flowStore = useFlowStore();
const { roles: allRoles, users: allUsers, getUserById } = useOrganStore();
let { showTransactorDrawer, setTransactorConfig } = flowStore;
let isTransactorDrawerOpened = computed(() => flowStore.isTransactorDrawerOpened);
let transactorConfig0 = computed(() => flowStore.transactorConfig0);
let workFlowDef = computed(() => flowStore.flowDefinition.workFlowDef);
let visible = computed({
  get: () => isTransactorDrawerOpened.value,
  set: () => closeDrawer(),
});

let viewEditorType = ref(0); // 界面编辑类型    0:办理人; 1:操作权限
let _uid = ref(0);
let flowNodeConfig = ref({});

// 是否为单个办理人节点
let onlyOneNode = computed(() => {
  let fristAssigneeType = flowNodeConfig.value.transactors[0].transactorType;
  return [ASSIGNEE.INITIATOR_CHOICE].includes(fristAssigneeType);
});

// 是否含有多个办理人
let haveMultiNode = computed(() => {
  return flowNodeConfig.value.transactors.length > 1;
});

// 是否设置了发起人自选，角色，指定办理人
let isInitiatorChoiceOrRoleOrAssignee = computed(() => {
  let fristAssigneeType = flowNodeConfig.value.transactors[0].transactorType;
  return [ASSIGNEE.ROLE, ASSIGNEE.ASSIGNEE, ASSIGNEE.INITIATOR_CHOICE].includes(fristAssigneeType);
});

// 多个审核人设置的类型是否一致, 类型一致时才会有依次办理
let isSameTransactorType = computed(() => {
  if (flowNodeConfig.value.transactors.length == 1) return false;
  let haveSameType = true;
  let tmpAssigneeType = flowNodeConfig.value.transactors[0].transactorType;
  for (let i = 1; i < flowNodeConfig.value.transactors.length; i++) {
    let tmpAssignee = flowNodeConfig.value.transactors[i];
    if (tmpAssigneeType != tmpAssignee.transactorType) {
      haveSameType = false;
      break;
    }
  }
  // 如果不能使用序签，则默认会签
  if (!haveSameType) {
    if (flowNodeConfig.value.multiInstanceApprovalType == 3) {
      flowNodeConfig.value.multiInstanceApprovalType = 1;
    }
  }
  return haveSameType;
});

// 办理人选择指定成员
let showChooseTransactor = ref(false); // 是否显示指定成员对话框
let selectedAssignee = ref({}); // 当前选中的单个办理人设置
const onAssigneeClick = (item) => {
  selectedAssignee.value = item;
  showChooseTransactor.value = true;
};

watch(transactorConfig0, (val) => {
  flowNodeConfig.value = val.value;
  viewEditorType.value = 0;
  //   // 如果办理人为空, 且设置的是交给管理员时
  //   let { flowNodeNoAuditorType, flowNodeAuditAdmin } = flowNodeConfig.value;
  //   if (flowNodeNoAuditorType == 2 && !flowNodeAuditAdmin) {
  //     flowNodeConfig.value.flowNodeAuditAdmin = workFlowDef.value.flowAdminIds[0];
  //   }
  console.log("办理人节点", flowNodeConfig);
  _uid = val.id;
});

watch(
  flowNodeConfig,
  (newVal) => {
    if (newVal.transactors.length == 1) {
      // 只设置了一个办理人
      let fristAssigneeType = flowNodeConfig.value.transactors[0].transactorType;

      // 是否设置了发起人自选，角色，指定办理人
      if (
        [ASSIGNEE.ROLE, ASSIGNEE.ASSIGNEE, ASSIGNEE.INITIATOR_CHOICE].includes(fristAssigneeType) &&
        [0, 3].includes(flowNodeConfig.value.multiInstanceApprovalType)
      ) {
        if (flowNodeConfig.value.multiInstanceApprovalType == 0) {
          flowNodeConfig.value.multiInstanceApprovalType = 1;
        }
      }
    } else {
      // 如果设置了多个办理人，默认会签
      if (flowNodeConfig.value.multiInstanceApprovalType == 0) {
        flowNodeConfig.value.multiInstanceApprovalType = 1;
      }
    }
  },
  { deep: true }
);

// 切换上级和部门负责人的人事层级关系
const switchLayerType = (assignee) => {
  assignee.layerType = assignee.layerType == 0 ? 1 : 0;
};

// 办理人类型切换时
const onTransactorTypeChanged = (assignee) => {
  console.log("办理人类型切换时", assignee);
  let { transactorType } = assignee;
  if ([1, 2].includes(transactorType)) {
    assignee.layerType = 0;
    assignee.layer = 0;
    delete assignee.roles;
    delete assignee.transactors;
  } else if ([0, 7].includes(transactorType)) {
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.roles;
    delete assignee.transactors;
  } else if ([3].includes(transactorType)) {
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.transactors;
  } else if ([4].includes(transactorType)) {
    assignee.transactors = [];
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.roles;
  }
};

// 节点办理人为空选项改变时
const onNoTransactorTypeChanged = (type) => {
  if (type == 1) {
    delete flowNodeConfig.value.flowNodeAuditAdmin;
  } else if (type == 2) {
    delete flowNodeConfig.value.flowNodeNoAuditorAssignee;
  } else {
    delete flowNodeConfig.value.flowNodeNoAuditorAssignee;
    delete flowNodeConfig.value.flowNodeAuditAdmin;
  }
};

// 添加办理人
const addTransactor = () => {
  flowNodeConfig.value.transactors.push({
    rid: Snowflake.generate(),
    transactorType: 0,
  });
};

// 删除办理人
const delTransactor = (approver) => {
  ArrayUtil.remove(flowNodeConfig.value.transactors, "rid", approver.rid);
  // 当设置的办理人删除到一个时。节点类型设置为：非多实例审批
  if (flowNodeConfig.value.transactors.length === 1) {
    flowNodeConfig.value.multiInstanceApprovalType = 0;
  }
};

const saveTransactor = () => {
  setTransactorConfig({
    value: toRaw(flowNodeConfig.value),
    flag: true,
    id: _uid,
  });
  close();
};

const close = () => {
  showTransactorDrawer(false);
};

onBeforeMount(() => {});
onMounted(() => {});
</script>

<style lang="less">
.transact-drawer__content {
  user-select: none;

  .transact-editor-tab-wrapper {
    margin-top: 24px;

    .item-content-editor,
    .item-content-auth {
      margin-top: 8px;

      .transactor-list {
        .transactor-wrapper {
          border: 1px solid #e4e5e7;
          border-radius: 6px;
          overflow: hidden;

          + .transactor-wrapper {
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

          // .main-content {
          // }

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

              span {
                color: #8f959e;
                font-weight: 400;
                font-size: 13px;
              }
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

      .approver-null-select-box {
        margin-top: 8px;
      }

      .auth-list {
        display: flex;
        flex-direction: column;

        .auth-item {
          margin-top: 10px;
        }
      }
    }
  }

  .arco-radio-group-button {
    width: 100%;

    .arco-radio-button {
      flex: 1;
      text-align: center;
    }
  }

  .item-key-wrapper {
    .item-key {
      color: #1f2329;
      font-weight: 600;
    }
  }

  .item-content {
    margin-top: 8px;

    .item-wrap {
      + .item-wrap {
        margin-top: 24px;
      }
    }

    .more-info {
      line-height: 20px;
      color: #646a73;
      font-weight: 400;

      p {
        position: relative;
        padding-left: 10px;
        margin-top: 8px;

        &::before {
          content: "";
          width: 4px;
          height: 4px;
          position: absolute;
          top: 9px;
          left: 0;
          border-radius: 2px;
          background: #3370ff;
        }
      }
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
