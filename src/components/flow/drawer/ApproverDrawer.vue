<template>
  <a-drawer
    v-if="visible"
    :append-to-body="true"
    :width="540"
    :visible="visible"
    :closable="false"
    @cancel="close()"
    @ok="saveApprover()"
    ok-text="保存">
    <template #title>
      <EditableText :value="flowNodeConfig.name" @change="(v) => (flowNodeConfig.name = v)" />
    </template>

    <div class="approver-drawer__content">
      <!-- 节点审批类型 -->
      <div class="approval-editor-node-type-wrapper">
        <div class="item-key-wrapper">
          <div class="item-key">审批类型</div>
        </div>
        <div class="item-content">
          <a-radio-group v-model="flowNodeConfig.approvalType">
            <a-radio :value="0">人工审批</a-radio>
            <a-radio :value="1">自动通过</a-radio>
            <a-radio :value="2">自动拒绝</a-radio>
          </a-radio-group>
        </div>
      </div>

      <!-- 审批人选择界面 -->
      <div class="approval-editor-tab-wrapper" v-if="flowNodeConfig.approvalType == 0">
        <a-radio-group type="button" v-model="viewEditorType" size="large">
          <a-radio :value="0">设置审批人</a-radio>
          <!-- <a-radio value="right">表单权限</a-radio> -->
          <a-radio :value="1">操作权限</a-radio>
        </a-radio-group>

        <!-- 设置审批人 -->
        <div class="item-content-editor" v-if="viewEditorType == 0">
          <div class="content-wrap">
            <div class="item-content">
              <!-- 审批人列表 -->
              <div class="item-wrap approver">
                <div class="approver-list">
                  <div class="approver-wrapper" v-for="(item, idx) in flowNodeConfig.assignees">
                    <div class="header">
                      <span>审批人{{ idx + 1 }}</span>
                      <icon-delete :style="{ fontSize: '18px' }" @click="delApprover(item)" v-if="flowNodeConfig.assignees.length > 1" />
                    </div>
                    <div class="main-content">
                      <a-radio-group class="radio-group" v-model="item.assigneeType" @change="onAssigneeTypeChanged(item)">
                        <a-grid :cols="3" :colGap="0" :rowGap="10">
                          <a-grid-item><a-radio :value="0">发起人本人</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="1">上级</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="2">部门负责人</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="3">角色</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="4">指定成员</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="5" :disabled="haveMultiNode">连续多级上级</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="6" :disabled="haveMultiNode">连续多级部门负责人</a-radio></a-grid-item>
                          <a-grid-item><a-radio :value="7" :disabled="haveMultiNode">发起人自选</a-radio></a-grid-item>
                        </a-grid>
                      </a-radio-group>
                    </div>
                    <div class="sub-content" v-if="![0, 7].includes(item.assigneeType)">
                      <div class="sub-content-top-line"></div>
                      <template v-if="item.assigneeType == 1">
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
                      <template v-else-if="item.assigneeType == 2">
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
                      <template v-else-if="item.assigneeType == 3">
                        <p class="bold">选择角色</p>
                        <a-form-item tooltip="请选择角色" label="组织角色">
                          <a-select multiple placeholder="请选择角色" v-model="item.roles">
                            <a-option v-for="role in allRoles" :value="role.id" :label="role.name"></a-option>
                          </a-select>
                        </a-form-item>
                      </template>
                      <template v-else-if="item.assigneeType == 4">
                        <p class="bold">添加成员<span>（不能超过 25 人）</span></p>
                        <div class="assignee-box">
                          <a-button size="small" @click="onAssigneeClick(item)"><icon-plus /></a-button>
                          <span class="assignee-list">
                            <a-tag v-for="userId in item.assignees">{{ getUserById(userId).name }}</a-tag>
                          </span>
                          <OrganChooseBox
                            v-if="showChooseAssignee"
                            v-model:visible="showChooseAssignee"
                            v-model:selected="selectedAssignee.assignees"
                            :hidden-dept="true"
                            :hidden-role="true" />
                        </div>
                      </template>
                      <template v-else-if="item.assigneeType == 5">
                        <p class="bold">审批终点</p>
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
                      <template v-else-if="item.assigneeType == 6">
                        <p class="bold">审批终点</p>
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
                    </div>
                  </div>
                </div>

                <!-- 添加审核人按钮 -->
                <div class="add-operator">
                  <a-link @click="addApprover()" v-if="!onlyOneNode">
                    <template #icon><icon-plus /></template>添加审批人
                  </a-link>
                </div>
              </div>

              <!-- 会签、或签、序签 -->
              <div class="item-wrap sign-type" v-if="haveMultiNode || isInitiatorChoiceOrRoleOrAssignee">
                <div class="item-key-wrapper">
                  <div class="item-key">多人审批时采用的审批方式</div>
                </div>
                <div class="item-content">
                  <a-radio-group direction="vertical" v-model="flowNodeConfig.multiInstanceApprovalType">
                    <a-radio :value="1">会签（需所有审批人同意）</a-radio>
                    <a-radio :value="2">或签（一名审批人同意即可）</a-radio>
                    <a-radio :value="3" v-if="isSameAssigneeType">依次审批（按顺序依次审批）</a-radio>
                  </a-radio-group>
                </div>
              </div>

              <!-- 审批人为空时 -->
              <div class="item-wrap approver-null">
                <div class="item-key-wrapper">
                  <div class="item-key">审批人为空时</div>
                </div>
                <div class="item-content">
                  <a-radio-group v-model="flowNodeConfig.flowNodeNoAuditorType" @change="onNoAuditorTypeChanged">
                    <a-radio :value="0">自动通过</a-radio>
                    <a-radio :value="1">指定人员审批</a-radio>
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

              <!-- 审批人为自己时 -->
              <div class="item-wrap approver-self">
                <div class="item-key-wrapper">
                  <div class="item-key">审批人与提交人为同一人时</div>
                </div>
                <div class="item-content">
                  <a-radio-group class="radio-group" v-model="flowNodeConfig.flowNodeSelfAuditorType">
                    <a-grid :cols="2" :colGap="0" :rowGap="10">
                      <a-grid-item><a-radio :value="0">由发起人对自己审批</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="1">自动跳过</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="2">转交给直接上级审批</a-radio></a-grid-item>
                      <a-grid-item><a-radio :value="3">转交给部门负责人审批</a-radio></a-grid-item>
                    </a-grid>
                  </a-radio-group>
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
                <a-checkbox class="auth-item" v-model="flowNodeConfig.signable" :value="1">允许加签 / 减签</a-checkbox>
                <a-checkbox class="auth-item" v-model="flowNodeConfig.backable" :value="1">允许回退</a-checkbox>
              </div>
              <div class="item-wrap tip">
                <div class="item-key-wrapper">
                  <p class="item-key">提示：</p>
                </div>
                <div class="more-info">
                  <p>若审批人设置为连续多级上级、连续多级部门负责人时，允许的加签 / 减签不能生效。</p>
                  <p>若多人审批方式为依次审批时，允许的加签 / 减签不能生效。</p>
                </div>
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

let flowStore = useFlowStore();
const { roles: allRoles, users: allUsers, getUserById } = useOrganStore();
let { showApproverDrawer, setApproverConfig } = flowStore;
let isApproverDrawerOpened = computed(() => flowStore.isApproverDrawerOpened);
let approverConfig0 = computed(() => flowStore.approverConfig0);
let workFlowDef = computed(() => flowStore.flowDefinition.workFlowDef);
let visible = computed({
  get: () => isApproverDrawerOpened.value,
  set: () => closeDrawer(),
});

let viewEditorType = ref(0); // 界面编辑类型    0:审批人; 1:操作权限
let _uid = ref(0);
let flowNodeConfig = ref({
  // type: 1,
  // approvalType: 0,
  // multiInstanceApprovalType: 0,
  // flowNodeNoAuditorType: 0,
  // flowNodeSelfAuditorType: 0,
  // assignees: [
  // {
  //   id: Snowflake.generate(),
  //   assigneeType: 0,
  //   layerType: 0,
  // },
  // ],
});

// 是否为单个审批人节点
let onlyOneNode = computed(() => {
  let fristAssigneeType = flowNodeConfig.value.assignees[0].assigneeType;
  return [5, 6, 7].includes(fristAssigneeType);
});

// 是否含有多个审批人
let haveMultiNode = computed(() => {
  return flowNodeConfig.value.assignees.length > 1;
});

// 是否设置了发起人自选，角色，指定审批人
let isInitiatorChoiceOrRoleOrAssignee = computed(() => {
  let fristAssigneeType = flowNodeConfig.value.assignees[0].assigneeType;
  return [3, 4, 7].includes(fristAssigneeType);
});

// 多个审核人设置的类型是否一致, 类型一致时才会有依次审批
let isSameAssigneeType = computed(() => {
  if (flowNodeConfig.value.assignees.length == 1) return false;
  let haveSameType = true;
  let tmpAssigneeType = flowNodeConfig.value.assignees[0].assigneeType;
  for (let i = 1; i < flowNodeConfig.value.assignees.length; i++) {
    let tmpAssignee = flowNodeConfig.value.assignees[i];
    if (tmpAssigneeType != tmpAssignee.assigneeType) {
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

// 审批人选择指定成员
let showChooseAssignee = ref(false); // 是否显示指定成员对话框
let selectedAssignee = ref({}); // 当前选中的单个审批人设置
const onAssigneeClick = (item) => {
  selectedAssignee.value = item;
  showChooseAssignee.value = true;
};

watch(approverConfig0, (val) => {
  flowNodeConfig.value = val.value;
  viewEditorType.value = 0;
  console.log("审批人节点", flowNodeConfig);
  _uid = val.id;
});

watch(
  flowNodeConfig,
  (newVal) => {
    if (newVal.assignees.length == 1) {
      // 只设置了一个审批人
      let fristAssigneeType = flowNodeConfig.value.assignees[0].assigneeType;
      // 是否设置连续多级上级,连续多级部门负责人
      if ([5, 6].includes(fristAssigneeType)) {
        flowNodeConfig.value.multiInstanceApprovalType = 3;
      }

      // 是否设置了发起人自选，角色，指定审批人
      if ([3, 4, 7].includes(fristAssigneeType) && [0, 3].includes(flowNodeConfig.value.multiInstanceApprovalType)) {
        if (flowNodeConfig.value.multiInstanceApprovalType == 0) {
          flowNodeConfig.value.multiInstanceApprovalType = 1;
        }
      }
    } else {
      // 如果设置了多个审批人，默认会签
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

// 审批人类型切换时
const onAssigneeTypeChanged = (assignee) => {
  console.log("审批人类型切换时", assignee);
  let { assigneeType } = assignee;
  if ([1, 2, 5, 6].includes(assigneeType)) {
    assignee.layerType = 0;
    assignee.layer = 0;
    delete assignee.roles;
    delete assignee.assignees;
  } else if ([0, 7].includes(assigneeType)) {
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.roles;
    delete assignee.assignees;
  } else if ([3].includes(assigneeType)) {
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.assignees;
  } else if ([4].includes(assigneeType)) {
    assignee.assignees = [];
    delete assignee.layerType;
    delete assignee.layer;
    delete assignee.roles;
  }
};

// 节点审批人为空选项改变时
const onNoAuditorTypeChanged = (type) => {
  if (type == 1) {
    delete flowNodeConfig.value.flowNodeAuditAdmin;
  } else if (type == 2) {
    delete flowNodeConfig.value.flowNodeNoAuditorAssignee;
  } else {
    delete flowNodeConfig.value.flowNodeNoAuditorAssignee;
    delete flowNodeConfig.value.flowNodeAuditAdmin;
  }
};

// 添加审批人
const addApprover = () => {
  flowNodeConfig.value.assignees.push({
    rid: Snowflake.generate(),
    assigneeType: 0,
  });
};

// 删除审批人
const delApprover = (approver) => {
  ArrayUtil.remove(flowNodeConfig.value.assignees, "rid", approver.rid);
  // 当设置的审批人删除到一个时。节点类型设置为：非多实例审批
  if (flowNodeConfig.value.assignees.length === 1) {
    flowNodeConfig.value.multiInstanceApprovalType = 0;
  }
};

const saveApprover = () => {
  setApproverConfig({
    value: toRaw(flowNodeConfig.value),
    flag: true,
    id: _uid,
  });
  close();
};

const close = () => {
  showApproverDrawer(false);
};

onBeforeMount(() => {});
onMounted(() => {});
</script>

<style lang="less">
.approver-drawer__content {
  user-select: none;

  .approval-editor-tab-wrapper {
    margin-top: 24px;

    .item-content-editor,
    .item-content-auth {
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

      .item-wrap {
        + .item-wrap {
          margin-top: 24px;
        }
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

      .more-info {
        line-height: 20px;
        color: #646a73;

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
