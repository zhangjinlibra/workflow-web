<template>
  <div :class="['add-node-btn-box']">
    <div :class="['add-node-btn', 'affix_' + uid]">
      <a-popover
        :popup-visible="visible"
        position="rt"
        popup-container=".flow-desgin-main"
        content-class="add-node-btn-box-wrap"
        trigger="click"
        :show-arrow="false"
        @popup-visible-change="onPopupStatusChange">
        <template #content>
          <div class="add-node-popover-wrap">
            <div class="add-node-popover-item approver" @click="addType(1)">
              <div class="node-icon"><span class="iconfont-approval-admin" v-html="icons[0]"></span></div>
              <div class="node-text">审批人</div>
            </div>
            <div class="add-node-popover-item notifier" @click="addType(2)">
              <div class="node-icon"><span class="iconfont-approval-admin" v-html="icons[1]"></span></div>
              <div class="node-text">抄送人</div>
            </div>
            <div class="add-node-popover-item condition" @click="addType(4)">
              <div class="node-icon"><span class="iconfont-approval-admin" v-html="icons[2]"></span></div>
              <div class="node-text">条件分支</div>
            </div>
          </div>
        </template>
        <button class="btn" type="button"><icon-plus /></button>
      </a-popover>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Snowflake from "./common/Snowflake";
import { IconPlus } from "@arco-design/web-vue/es/icon";

let icons = ref(["&#xe658", "&#xe656", "&#xe63f"]);
let emits = defineEmits(["update:childNodeP"]);
let visible = ref(false);
let uid = ref(Snowflake.generate()); //当前组件的id
let props = defineProps({
  childNodeP: {
    type: Object,
    default: () => null,
  },
});

const onPopupStatusChange = (is) => {
  visible.value = is;
};

const addType = (type) => {
  visible.value = false;
  if (type != 4) {
    var newNode;
    if (type == 1) {
      console.log("增加审核人节点", props.childNodeP);
      newNode = {
        name: "审核人",
        type: 1,
        approvalType: 0,
        multiInstanceApprovalType: 0,
        flowNodeNoAuditorType: 0,
        flowNodeSelfAuditorType: 0,
        assignees: [{ rid: Snowflake.generate(), assigneeType: 0, layerType: 0 }], // 审核人
        childNode: props.childNodeP,
      };
    } else if (type == 2) {
      newNode = {
        name: "抄送人",
        type: 2,
        ccs: [{ rid: Snowflake.generate(), ccType: 0, layerType: 0 }], // 抄送人
        childNode: props.childNodeP,
      };
    }
    emits("update:childNodeP", newNode);
  } else {
    console.log("增加路由节点", props.childNodeP);
    let newNode = {
      name: "路由",
      type: 4,
      childNode: null,
      conditionNodes: [
        { name: "条件1", type: 3, priorityLevel: 1, conditionGroups: [], childNode: props.childNodeP },
        { name: "条件2", type: 3, priorityLevel: 2, conditionGroups: [], childNode: null },
      ],
    };
    emits("update:childNodeP", newNode);
  }
};
</script>

<style scoped lang="less">
.add-node-btn-box {
  width: 240px;
  display: -webkit-inline-box;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }

  .add-node-btn {
    user-select: none;
    width: 240px;
    padding: 28px 0;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    -webkit-box-flex: 1;
    flex-grow: 1;
    position: relative;

    .btn {
      outline: none;
      cursor: pointer;
      box-shadow: 0 2px 4px 0 #0000001a;
      width: 30px;
      height: 30px;
      background: #3296fa;
      border-radius: 50%;
      position: relative;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

      .arco-icon {
        color: #fff;
      }

      &:hover {
        box-shadow: 0 13px 27px 0 #0000001a;
      }

      &:active {
        transform: none;
        background: #1e83e9;
        box-shadow: 0 2px 4px 0 #e5e5e5;
      }
    }
  }
}
</style>

<style lang="less">
.add-node-btn-box-wrap {
  padding: 8px 10px;
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px #00000026;
  font-size: 12px;
  cursor: default;

  .arco-popover-content {
    margin-top: 0;
  }

  .add-node-popover-wrap {
    display: flex;

    .add-node-popover-item {
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;

      + .add-node-popover-item {
        margin-left: 8px;
      }

      &:hover {
        background-color: rgba(31, 35, 41, 0.08);
      }

      .node-icon {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        margin: 6px 4px 4px;
        display: flex;
        align-items: center;
        justify-content: center;

        .iconfont-approval-admin {
          font-size: 40px;
        }
      }

      .node-text {
        text-align: center;
        min-width: 56px;
      }
    }

    .approver {
      .iconfont-approval-admin {
        color: #ff943e;
      }
    }

    .notifier {
      .iconfont-approval-admin {
        color: #3296fa;
      }
    }

    .condition {
      .iconfont-approval-admin {
        color: #2eb795;
      }
    }
  }
}
</style>
