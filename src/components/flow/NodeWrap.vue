<template>
  <!-- 非网关节点 -->
  <div class="node-wrap" v-if="[NODE.START, NODE.APPROVE, NODE.COPY, NODE.TRANSACT].includes(nodeConfig.type)">
    <div class="node-wrap-box" :class="{ 'start-node': nodeConfig.type == NODE.START }">
      <div class="title" :style="{ background: nodeBgColor }">
        <!-- 开始节点 -->
        <span v-if="nodeConfig.type == NODE.START">{{ nodeConfig.name }}</span>
        <!-- 任务、办理、抄送节点 -->
        <template v-else>
          <!-- <span class="iconfont-approval-admin">{{ nodeConfig.type == 1 ? "&#xe658" : "&#xe656" }}</span> -->
          <input
            v-if="isNodeNameEdit"
            type="text"
            class="editable-title-input"
            @blur="onNameInputBlur()"
            @focus="$event.currentTarget.select()"
            v-focus
            v-model="nodeConfig.name"
            :maxlength="16"
            :placeholder="nodeDefaultName" />
          <template v-else>
            <span class="editable-title">
              <span @click="onNameInputClick()">{{ nodeConfig.name }}</span>
            </span>
            <icon-close class="close" :size="14" @click="onNodeRemove" />
          </template>
        </template>
      </div>
      <div class="content" @click="onNodeCardClick">
        <!-- 发起人节点 -->
        <a-tooltip v-if="nodeConfig.type == NODE.START" :content="showNodeContent" mini content-class="node-content-tooltip">
          <span class="text">{{ nodeDefaultName }}：{{ showNodeContent }}</span>
        </a-tooltip>
        <!-- 审核人、抄送人、办理人节点 -->
        <template v-else-if="[NODE.APPROVE, NODE.COPY, NODE.TRANSACT].includes(nodeConfig.type)">
          <span class="placeholder" v-if="!showNodeContent">请选择{{ nodeDefaultName }}</span>
          <a-tooltip v-else mini :content="showNodeContent" content-class="node-content-tooltip">
            <span class="text">{{ nodeDefaultName }}：{{ showNodeContent }} </span>
          </a-tooltip>
        </template>
        <div style="color: #a1a5ad"><icon-right /></div>
      </div>
    </div>
    <AddNode v-model:childNodeP="nodeConfig.childNode" />
  </div>

  <!-- 网关节点 -->
  <div class="branch-wrap" v-if="nodeConfig.type == NODE.EXCLUSIVE_GATEWANY">
    <div class="branch-box-wrap">
      <div class="branch-box">
        <button class="add-branch" @click="onConditionAdd()"><icon-plus />添加条件</button>
        <!-- 网关分支节点 -->
        <div class="col-box" v-for="(item, index) in nodeConfig.conditionNodes" :key="index">
          <div class="condition-node">
            <div class="condition-node-box">
              <!-- 默认分支条件 -->
              <div class="auto-judge default-branch-node" v-if="isDefaultBranchNode(index)">
                <div class="title-wrapper">
                  <span class="editable-title">默认条件</span>
                  <span class="priority-title">优先级{{ item.priorityLevel }}</span>
                </div>
                <div class="content-wrapper">
                  <div class="content">未满足时其他条件时，将进入默认流程</div>
                </div>
              </div>
              <!-- 其他分支条件 -->
              <div v-else class="auto-judge">
                <div class="title-wrapper">
                  <input
                    v-if="nodeNameInputList[index]"
                    type="text"
                    class="editable-title-input"
                    @blur="onNameInputBlur(index)"
                    @focus="$event.currentTarget.select()"
                    :maxlength="16"
                    v-focus
                    v-model="item.name" />
                  <template v-else>
                    <span class="editable-title" @click="onNameInputClick(index)"> {{ item.name }} </span>
                    <span class="priority-title">优先级{{ item.priorityLevel }}</span>
                    <a-link class="close" @click="onConditionRemove(index)">
                      <template #icon><icon-close /></template>
                    </a-link>
                  </template>
                </div>
                <div class="content-wrapper">
                  <div class="sort-left" v-if="index != 0" @click="branchSwitchIdx(index, -1)">
                    <icon-left />
                  </div>
                  <div class="content" @click="onNodeCardClick(item.priorityLevel)">
                    <span v-if="(getGatewayBranch(nodeConfig, index).conditionGroups || []).length == 0" class="placeholder">请设置条件</span>
                    <!-- 卡片上显示分支条件 -->
                    <a-tooltip v-else mini :content="showConditionContent(nodeConfig, index)" content-class="node-content-tooltip">
                      <span class="text">{{ showConditionContent(nodeConfig, index) }}</span>
                    </a-tooltip>
                  </div>
                  <div
                    class="sort-right"
                    v-if="index != nodeConfig.conditionNodes.length - 1 && !isDefaultBranchNode(index + 1)"
                    @click="branchSwitchIdx(index)">
                    <icon-right />
                  </div>
                </div>
              </div>
              <AddNode v-model:childNodeP="item.childNode" />
            </div>
          </div>
          <NodeWrap v-if="item.childNode" v-model:nodeConfig="item.childNode" />
          <template v-if="index == 0">
            <div class="top-left-cover-line"></div>
            <div class="bottom-left-cover-line"></div>
          </template>
          <template v-if="index == nodeConfig.conditionNodes.length - 1">
            <div class="top-right-cover-line"></div>
            <div class="bottom-right-cover-line"></div>
          </template>
        </div>
      </div>
      <AddNode v-model:childNodeP="nodeConfig.childNode" />
    </div>
  </div>

  <!-- 分支汇合节点 -->
  <NodeWrap v-if="nodeConfig.childNode" v-model:nodeConfig="nodeConfig.childNode" />
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from "vue";
import { useFlowStore, useOrganStore } from "@/stores/index";
import ArrayUtil from "./common/ArrayUtil";
import { showExpNodeContent } from "./common/FormExp";
import { NODE } from "./common/FlowConstant";
import { IconClose, IconRight, IconPlus, IconLeft } from "@arco-design/web-vue/es/icon";
let _uid = getCurrentInstance().uid;

// 属性
let props = defineProps({
  nodeConfig: { type: Object, default: () => ({}) },
  flowPermission: { type: Object, default: () => [] },
});

let emits = defineEmits(["update:flowPermission", "update:nodeConfig"]);
let { roles: allRoles, users: allUsers, getById } = useOrganStore();
let flowStore = useFlowStore();
let {
  flowDefinition,
  showPromoterDrawer,
  showApproverDrawer,
  showCopyerDrawer,
  showConditionDrawer,
  showTransactorDrawer,
  setPromoterConfig,
  setApproverConfig,
  setCopyerConfig,
  setConditionsConfig,
  setTransactorConfig,
} = flowStore;
let promoterConfig0 = computed(() => flowStore.promoterConfig0);
let approverConfig0 = computed(() => flowStore.approverConfig0);
let copyerConfig0 = computed(() => flowStore.copyerConfig0);
let conditionsConfig0 = computed(() => flowStore.conditionsConfig0);
let transactorConfig0 = computed(() => flowStore.transactorConfig0);

// 节点基本信息
let nodeSettings = reactive({});
nodeSettings[NODE.START] = { placeholder: "发起人", bgColor: "#a9b4cd" };
nodeSettings[NODE.APPROVE] = { placeholder: "审核人", bgColor: "#ff943e" };
nodeSettings[NODE.COPY] = { placeholder: "抄送人", bgColor: "#3296fa" };
nodeSettings[NODE.TRANSACT] = { placeholder: "办理人", bgColor: "#926bd5" };
let nodeDefaultName = computed(() => nodeSettings[props.nodeConfig.type].placeholder);
let nodeBgColor = computed(() => nodeSettings[props.nodeConfig.type].bgColor);

// nodeType 0发起人 1审批 2抄送 3条件 4路由
// 节点卡片显示的内容
let showNodeContent = computed(() => {
  let nodeType = props.nodeConfig.type;
  if (nodeType == NODE.START) {
    // 开始节点
    let { type, flowInitiators } = props.flowPermission;
    if (type == 0) return "全员可提交";
    else if (type == 2) return "均不可提交";
    else return (flowInitiators || []).map((i) => getById(i.id).name).join(", ");
  } else if (nodeType == NODE.APPROVE) {
    // 审批人节点
    let { assignees, approvalType } = props.nodeConfig;
    if (approvalType == 1) return "自动通过";
    else if (approvalType == 2) return "自动拒绝";
    else {
      return assignees
        .map((assignee) => {
          let { assigneeType, layerType, layer, roles, assignees } = assignee;
          if (assigneeType == 0) return "发起人本人";
          else if (assigneeType == 1) {
            if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}上级`;
            else return `最高上级减${layer != 0 ? layer + "级" : ""}`;
          } else if (assigneeType == 2) {
            if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}部门负责人`;
            else return `最高部门负责人减${layer != 0 ? layer + "级" : ""}`;
          } else if (assigneeType == 3) {
            return roles.map((roleId) => ArrayUtil.get(allRoles, "id", roleId).name).join(", ");
          } else if (assigneeType == 4) {
            return assignees.map((userId) => ArrayUtil.get(allUsers, "id", userId).name).join(", ");
          } else if (assigneeType == 5) {
            return "连续多级上级";
          } else if (assigneeType == 6) {
            return "连续多级部门负责人";
          } else if (assigneeType == 7) {
            return "发起人自选";
          }
        })
        .join(", ");
    }
  } else if (nodeType == NODE.COPY) {
    // 抄送人节点
    let { ccs } = props.nodeConfig;
    return ccs
      .map((cc) => {
        let { ccType, layerType, layer, roles, assignees } = cc;
        if (ccType == 0) return "发起人本人";
        else if (ccType == 1) {
          if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}上级`;
          else return `最高上级减${layer != 0 ? layer + "级" : ""}`;
        } else if (ccType == 2) {
          if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}部门负责人`;
          else return `最高部门负责人减${layer != 0 ? layer + "级" : ""}`;
        } else if (ccType == 3) {
          return roles.map((roleId) => ArrayUtil.get(allRoles, "id", roleId).name).join(", ");
        } else if (ccType == 4) {
          return assignees.map((userId) => ArrayUtil.get(allUsers, "id", userId).name).join(", ");
        }
      })
      .join(", ");
  } else if (nodeType == NODE.TRANSACT) {
    // 办理人节点
    let { transactors } = props.nodeConfig;
    return transactors
      .map((transactor) => {
        let { transactorType, layerType, layer, roles, assignees } = transactor;
        if (transactorType == 0) return "发起人本人";
        else if (transactorType == 1) {
          if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}上级`;
          else return `最高上级减${layer != 0 ? layer + "级" : ""}`;
        } else if (transactorType == 2) {
          if (layerType == 0) return `直属${layer != 0 ? layer + "级" : ""}部门负责人`;
          else return `最高部门负责人减${layer != 0 ? layer + "级" : ""}`;
        } else if (transactorType == 3) {
          return roles.map((roleId) => ArrayUtil.get(allRoles, "id", roleId).name).join(", ");
        } else if (transactorType == 4) {
          return assignees.map((userId) => ArrayUtil.get(allUsers, "id", userId).name).join(", ");
        } else if (transactorType == 7) {
          return "发起人自选";
        }
      })
      .join(", ");
  }
  return null;
});

// 分支卡片显示的内容
let showConditionContent = (nodeConfig, index) => {
  let branchNode = nodeConfig.conditionNodes[index];
  console.log("条件分支：", branchNode);
  return showExpNodeContent(branchNode, flowDefinition.flowWidgets);
};
let getGatewayBranch = (gateway, index) => {
  return gateway.conditionNodes[index];
};
// 是否为默认分支节点
const isDefaultBranchNode = (idx) => {
  return props.nodeConfig.conditionNodes.length == idx + 1;
};

watch(promoterConfig0, (flow) => {
  if (flow.flag && flow.id === _uid) {
    emits("update:flowPermission", flow.value);
  }
});
watch(approverConfig0, (approver) => {
  if (approver.flag && approver.id === _uid) {
    emits("update:nodeConfig", approver.value);
  }
});
watch(transactorConfig0, (transactor) => {
  if (transactor.flag && transactor.id === _uid) {
    emits("update:nodeConfig", transactor.value);
  }
});
watch(copyerConfig0, (copyer) => {
  if (copyer.flag && copyer.id === _uid) {
    emits("update:nodeConfig", copyer.value);
  }
});
watch(conditionsConfig0, (condition) => {
  if (condition.flag && condition.id === _uid) {
    emits("update:nodeConfig", condition.value);
  }
});

let nodeNameInputList = ref([]);
let isNodeNameEdit = ref(false);

// 节点名称点击事件
const onNameInputClick = (index) => {
  if (index || index === 0) {
    nodeNameInputList.value[index] = true;
  } else {
    isNodeNameEdit.value = true;
  }
};

// 节点名称离开事件
const onNameInputBlur = (index) => {
  if (index || index === 0) {
    nodeNameInputList.value[index] = false;
    props.nodeConfig.conditionNodes[index].name = props.nodeConfig.conditionNodes[index].name || "条件";
  } else {
    isNodeNameEdit.value = false;
    props.nodeConfig.name = props.nodeConfig.name || nodeDefaultName;
  }
};

// 删除节点
const onNodeRemove = () => {
  emits("update:nodeConfig", props.nodeConfig.childNode);
};

// 新增分支条件
const onConditionAdd = () => {
  let len = props.nodeConfig.conditionNodes.length + 1;
  props.nodeConfig.conditionNodes.push({
    name: "条件" + len,
    type: 3,
    priorityLevel: len,
    conditionList: [],
    childNode: null,
  });
  emits("update:nodeConfig", props.nodeConfig);
};

// 删除分支条件
const onConditionRemove = (index) => {
  props.nodeConfig.conditionNodes.splice(index, 1);
  props.nodeConfig.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1;
    item.name = `条件${index + 1}`;
  });
  emits("update:nodeConfig", props.nodeConfig);
  if (props.nodeConfig.conditionNodes.length == 1) {
    if (props.nodeConfig.childNode) {
      if (props.nodeConfig.conditionNodes[0].childNode) {
        reconnectNode(props.nodeConfig.conditionNodes[0].childNode, props.nodeConfig.childNode);
      } else {
        props.nodeConfig.conditionNodes[0].childNode = props.nodeConfig.childNode;
      }
    }
    emits("update:nodeConfig", props.nodeConfig.conditionNodes[0].childNode);
  }
};

// 删除分支后重新连接节点
const reconnectNode = (data, addData) => {
  if (!data.childNode) {
    data.childNode = addData;
  } else {
    reconnectNode(data.childNode, addData);
  }
};

// type 0 发起人 1审批 2抄送 3条件 4路由
// 如果是非分支节点，则不需要传递参数
// 节点卡片点击
const onNodeCardClick = (priorityLevel) => {
  var { type } = props.nodeConfig;
  console.log("node_uid", _uid, type);
  if (type == NODE.START) {
    // 发起人
    showPromoterDrawer(true);
    setPromoterConfig({
      value: props.flowPermission,
      flag: false,
      id: _uid,
    });
  } else if (type == NODE.APPROVE) {
    // 审批人
    showApproverDrawer(true);
    setApproverConfig({
      value: { ...JSON.parse(JSON.stringify(props.nodeConfig)) },
      flag: false,
      id: _uid,
    });
  } else if (type == NODE.COPY) {
    // 抄送人
    showCopyerDrawer(true);
    setCopyerConfig({
      value: { ...JSON.parse(JSON.stringify(props.nodeConfig)) },
      flag: false,
      id: _uid,
    });
  } else if (type == NODE.TRANSACT) {
    // 办理人
    showTransactorDrawer(true);
    setTransactorConfig({
      value: { ...JSON.parse(JSON.stringify(props.nodeConfig)) },
      flag: false,
      id: _uid,
    });
  } else if (type == NODE.EXCLUSIVE_GATEWANY) {
    // 分支条件
    showConditionDrawer(true);
    setConditionsConfig({
      value: { ...JSON.parse(JSON.stringify(props.nodeConfig)) },
      priorityLevel,
      flag: false,
      id: _uid,
    });
  }
};

// 分支条件交换位置
const branchSwitchIdx = (index, type = 1) => {
  //向左-1,向右1
  props.nodeConfig.conditionNodes[index] = props.nodeConfig.conditionNodes.splice(index + type, 1, props.nodeConfig.conditionNodes[index])[0];
  props.nodeConfig.conditionNodes.map((item, index) => {
    item.priorityLevel = index + 1;
  });
  emits("update:nodeConfig", props.nodeConfig);
};

onMounted(() => {
  // if (props.nodeConfig.type == 1) {
  //   props.nodeConfig.error = !$func.setApproverStr(props.nodeConfig);
  // } else if (props.nodeConfig.type == 2) {
  //   props.nodeConfig.error = !$func.copyerStr(props.nodeConfig);
  // } else if (props.nodeConfig.type == 4) {
  //   resetConditionNodesErr();
  // }
});
</script>

<style lang="less">
@node-padding: 12px;
@node-width: 210px;
@node-heigth: 78px;
@node-border-radius: 8px;
@canvas-bg: #f5f5f7;

.node-wrap,
.branch-wrap {
  display: inline-flex;
  width: 100%;

  // 头部输入框
  .editable-title-input {
    width: 100%;
    height: 18px;
    margin: 0;
    padding-left: 4px;
    font-size: 12px;
    line-height: 18px;
    color: rgba(0, 0, 0, 0.65);
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: all 0.3s;

    &::placeholder {
      color: #bfbfbf;
    }

    &:focus {
      outline: 0;
      border-color: #40a9ff;
      box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.2);
    }

    &:hover {
      text-decoration: none;
      border-color: #40a9ff;
    }
  }
}

// 节点卡片、分支卡片样式
.node-wrap .node-wrap-box,
.branch-wrap .auto-judge {
  &::after {
    pointer-events: none;
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    border-radius: @node-border-radius;
    border: 1px solid transparent;
    transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
    box-shadow: 0 2px 5px #0000001a;
  }

  &:hover {
    &::after {
      // border: 1px solid #3296fa;
      // box-shadow: 0 0 6px #3296fa4d;
      box-shadow: 0 13px 27px 0 #0000001a;
    }
  }

  .close {
    display: none;

    .arco-link-icon {
      color: #8f959e;
      margin-right: 0;
    }
  }
}

// 节点样式
.node-wrap {
  flex-direction: column;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  padding: 0 50px;
  position: relative;

  .start-node {
    &::before {
      content: none !important;
    }
  }

  .node-wrap-box {
    position: relative;
    width: @node-width;
    min-height: @node-heigth;
    background: #fff;
    border-radius: @node-border-radius;
    cursor: pointer;
    display: flex;
    flex-direction: column;

    &::before {
      content: "";
      position: absolute;
      top: -8px;
      left: 50%;
      -webkit-transform: translateX(-50%);
      transform: translate(-50%);
      width: 0;
      height: 4px;
      border-style: solid;
      border-width: 8px 6px 4px;
      border-color: #cacaca transparent transparent;
      background: @canvas-bg;
    }

    &:hover {
      .close {
        display: inherit;
      }
    }

    .title {
      border-radius: @node-border-radius @node-border-radius 0 0;
      height: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #fff;
      padding: 0 @node-padding;

      &:hover {
        .editable-title span {
          border-bottom: 1px dashed #fff;
        }
      }

      .iconfont {
        font-size: 12px;
        margin-right: 5px;
      }

      .editable-title {
        flex: 1;
      }
    }

    .content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px @node-padding;

      .text {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
        word-wrap: break-word;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .placeholder {
        color: #a1a5ad;
      }
    }
  }
}

// 分支
.branch-wrap {
  .branch-box-wrap {
    display: flex;
    -webkit-box-orient: vertical;
    flex-direction: column;
    flex-wrap: wrap;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    min-height: 270px;
    width: 100%;
    -ms-flex-negative: 0;
    flex-shrink: 0;

    .branch-box {
      display: flex;
      overflow: visible;
      min-height: 180px;
      height: auto;
      border-bottom: 2px solid #ccc;
      border-top: 2px solid #ccc;
      position: relative;
      margin-top: 15px;

      .col-box {
        background: @canvas-bg;
        display: inline-flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        flex-direction: column;
        -webkit-box-align: center;
        align-items: center;
        position: relative;

        &:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          margin: auto;
          width: 2px;
          height: 100%;
          background-color: #cacaca;
        }

        .condition-node,
        .condition-node-box {
          display: inline-flex;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
          flex-direction: column;
          -webkit-box-flex: 1;
        }

        .condition-node {
          /* min-height: 220px */

          .condition-node-box {
            padding-top: 30px;
            padding-right: 50px;
            padding-left: 50px;
            -webkit-box-pack: center;
            justify-content: center;
            -webkit-box-align: center;
            align-items: center;
            flex-grow: 1;
            position: relative;

            &:before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              margin: auto;
              width: 2px;
              height: 100%;
              background-color: #cacaca;
            }
          }
        }
      }

      // 分页卡片样式
      .auto-judge {
        position: relative;
        width: @node-width;
        min-height: @node-heigth;
        background: #fff;
        border-radius: @node-border-radius;
        cursor: pointer;
        display: flex;
        flex-direction: column;

        &:hover {
          .priority-title {
            display: none;
          }

          .close {
            display: inherit;
          }
        }

        .title-wrapper {
          position: relative;
          font-size: 12px;
          color: #2eb795;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 @node-padding;
          border-radius: @node-border-radius @node-border-radius 0 0;
          border-bottom: 1px solid #f6f6f7;

          &:hover {
            .editable-title {
              border-bottom: 1px dashed #2eb795;
            }
          }
        }

        .content-wrapper {
          display: flex;
          flex: 1;
          align-items: center;

          .sort-left,
          .sort-right {
            height: 100%;
            display: flex;
            align-items: center;
            padding: 0 2px;

            &:hover {
              background: #efefef;
            }
          }

          .content {
            flex: 1;
            padding: 0 @node-padding;
            min-height: 100%;
            display: flex;
            align-items: center;

            .text {
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: normal;
              word-wrap: break-word;
              word-break: break-all;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .placeholder {
              color: #a1a5ad;
            }
          }
        }
      }

      .default-branch-node {
        color: #646a73 !important;

        .title-wrapper {
          color: #646a73 !important;
        }
      }

      .add-branch {
        border: none;
        outline: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        padding: 0 10px;
        height: 30px;
        border-radius: 15px;
        color: #3296fa;
        background: #fff;
        cursor: pointer;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

        &::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 15px;
        }

        &:hover {
          // transform: translate(-50%);
          // box-shadow: 0 8px 16px #0000001a;

          &::after {
            border: 1px solid #3296fa;
            box-shadow: 0 0 6px #3296fa4d;
          }
        }
      }

      .top-left-cover-line {
        left: -1px;
      }

      .top-right-cover-line {
        right: -1px;
      }

      .bottom-left-cover-line {
        left: -1px;
      }

      .bottom-right-cover-line {
        right: -1px;
      }

      .top-left-cover-line,
      .top-right-cover-line {
        position: absolute;
        height: 8px;
        width: 50%;
        background-color: @canvas-bg;
        top: -4px;
      }

      .bottom-left-cover-line,
      .bottom-right-cover-line {
        position: absolute;
        height: 8px;
        width: 50%;
        background-color: @canvas-bg;
        bottom: -4px;
      }
    }
  }
}

.node-content-tooltip {
  font-size: 12px;
  border-radius: var(--border-radius-medium);
}
</style>
