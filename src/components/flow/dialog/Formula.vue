<template>
  <a-modal :visible="visible" @ok="handleOk" @cancel="handleCancel" modal-class="flow-formula-modal" draggable>
    <template #title> 编辑计算公式 </template>
    <div class="calc-screen">
      <span class="clac-item" v-for="item in items">{{ item.name }}</span>
      <div class="calc-option">
        <div class="opt-btn" @click="onBackClicked()"><icon-arrow-left />退格</div>
        <div class="opt-btn" @click="onClearClicked()">清空</div>
      </div>
    </div>
    <div>
      <div class="item-container widgets-container">
        <div class="title">
          <a-tooltip content="仅数字、金额控件用于计算">
            <icon-info-circle-fill />
          </a-tooltip>
          控件：
        </div>
        <div class="item-wrapper">
          <a-button shape="round" v-for="item in widgets" @click="onItemClicked(item)">
            <template #icon>{{ item.name }}</template>
          </a-button>
        </div>
      </div>
      <div class="item-container symbols-container">
        <div class="title">符号：</div>
        <div class="item-wrapper">
          <a-button shape="round" v-for="item in symbols" @click="onItemClicked(item)">
            <template #icon>{{ item.name }}</template>
          </a-button>
        </div>
      </div>
      <div class="item-container numbers-container">
        <div class="title">数字：</div>
        <div class="item-wrapper">
          <a-button shape="round" v-for="item in numbers" @click="onItemClicked(item)">
            <template #icon>{{ item.name }}</template>
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
  <div class="formula"></div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useFlowStore } from "@/stores/index";
import { IconInfoCircleFill, IconArrowLeft } from "@arco-design/web-vue/es/icon";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import ObjectUtil from "../common/ObjectUtil";

let props = defineProps({ visible: { type: Boolean, defaule: false } });
let emits = defineEmits(["update:visible"]);

let flowStore = useFlowStore();
let { flowDefinition } = flowStore;
let widgets = ref([]);

const initWidgets = () => {
  widgets.value = [];
  let flowWidgets = ObjectUtil.copy(flowDefinition.flowWidgets || []);
  flowWidgets.forEach((widget) => {
    let { type, required, details } = widget;
    // 非明细组件
    if (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
      widgets.value.push({ name: widget.label, value: widget.name });
    }
    // 明细组件
    if (type == WIDGET.DETAIL && details && details.length > 0) {
      details.forEach((detail) => {
        let { type: detailType, required: detailRequired } = detail;
        if (detailRequired && [WIDGET.NUMBER, WIDGET.MONEY].includes(detailType)) {
          widgets.value.push({ name: detail.label + "合计", value: detail.name });
        }
      });
    }
  });
};

// 监听flowDefinition，组装可以使用的组件
watch(
  () => flowDefinition,
  () => {
    initWidgets();
  }
);

const symbols = ref([
  { name: "+", value: "+" },
  { name: "-", value: "-" },
  { name: "×", value: "*" },
  { name: "÷", value: "/" },
  { name: "(", value: "(" },
  { name: ")", value: ")" },
]);

const numbers = ref([
  { name: "0", value: "0" },
  { name: "1", value: "1" },
  { name: "2", value: "2" },
  { name: "3", value: "3" },
  { name: "4", value: "4" },
  { name: "5", value: "5" },
  { name: "6", value: "6" },
  { name: "7", value: "7" },
  { name: "8", value: "8" },
  { name: "9", value: "9" },
  { name: ".", value: "." },
]);

// 选中的元素
const items = ref([]);
const onItemClicked = (item) => items.value.push(item);
const onBackClicked = () => items.value.pop();
const onClearClicked = () => (items.value = []);

// 弹窗按钮
const handleOk = () => {
  handleCancel();
};
const handleCancel = () => emits("update:visible", false);
</script>

<style lang="less">
.flow-formula-modal {
  .calc-screen {
    position: relative;
    padding: 7px;
    background: #f3f3f3;
    border-radius: 5px;
    min-height: 120px;
    display: flex;
    flex-wrap: wrap;
    align-content: start;
    gap: 6px;

    .clac-item {
      height: 24px;
      display: flex;
      align-items: center;
      padding: 0 7px;
      color: #252834;
      border: 1px solid #e1e1e1;
      background-color: #fff;
      border-radius: 4px;
      user-select: none;
    }

    .calc-option {
      position: absolute;
      right: 10px;
      bottom: 8px;
      display: flex;
      align-items: center;
      z-index: 10;
      background: #f3f3f3;

      .opt-btn {
        cursor: pointer;
        padding: 0 4px;
        border-radius: 4px;
        user-select: none;

        + .opt-btn {
          margin-left: 4px;
        }

        &:hover {
          opacity: 0.8;
          background-color: #e5e6eb;
        }

        &:first-of-type {
          color: #1989fa;
        }

        &:last-of-type {
          color: #f56c6c;
        }
      }
    }
  }

  .item-container {
    margin-top: 20px;

    .arco-btn-icon {
      color: #1f2329;
    }

    .title {
      color: #8c8c8c;
      font-variant: tabular-nums;
      user-select: none;
    }

    .item-wrapper {
      margin-top: 4px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(32px, max-content));
      gap: 8px;
    }
  }
}
</style>
