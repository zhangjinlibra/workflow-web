<!-- 计算公式 -->
<template>
  <a-modal :visible="visible" @ok="handleOk" @cancel="handleClose" modal-class="flow-formula-modal" draggable>
    <template #title> 编辑计算公式 </template>
    <!-- 显示计算公式 -->
    <div class="calc-screen">
      <div class="calc-items">
        <span class="clac-item" v-for="e in items">{{ e.name }}</span>
      </div>
      <div class="calc-option">
        <div class="opt-btn" @click="handleBackClicked()"><icon-arrow-left />退格</div>
        <div class="opt-btn" @click="handleClearClicked()">清空</div>
      </div>
    </div>

    <!-- 计算公式选项 -->
    <div class="calc-options">
      <div class="item-box widgets-box">
        <div class="title">
          <a-tooltip content="仅必填的数字、金额控件用于计算">
            <icon-info-circle-fill />
          </a-tooltip>
          控件：
        </div>
        <div class="item-wrapper">
          <a-button shape="round" class="widget-btn" v-for="widget in widgets" @click="handleWidgetClicked(widget)">
            {{ widget.label }}
          </a-button>
        </div>
      </div>
      <div class="item-box symbols-container">
        <div class="title">符号：</div>
        <div class="item-wrapper">
          <a-button shape="round" v-for="symbol in symbols" @click="handleItemClicked(symbol)">
            <template #icon>{{ symbol.name }}</template>
          </a-button>
        </div>
      </div>
      <div class="item-box numbers-container">
        <div class="title">数字：</div>
        <div class="item-wrapper">
          <a-button shape="round" v-for="number in numbers" @click="handleItemClicked(number)">
            <template #icon>{{ number.name }}</template>
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
  <div class="formula"></div>
</template>

<script setup>
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { isNumber } from "@/utils/is";
import { Message } from "@arco-design/web-vue";
import { IconArrowLeft, IconInfoCircleFill } from "@arco-design/web-vue/es/icon";
import { ref, watch } from "vue";

let props = defineProps({
  visible: { type: Boolean, defaule: false },
  widgets: { type: Array, defaule: [] }, // 所有组件
  formulaItems: { type: Array, defaule: [] }, // 公式元素
});
let emits = defineEmits(["update:visible", "ok"]);

// 流程定义对象
// let { flowDefinition } = useFlowStore();

const symbols = ref([
  { name: "+", value: "+" },
  { name: "-", value: "-" },
  { name: "×", value: "*" },
  { name: "÷", value: "/" },
  { name: "(", value: "(" },
  { name: ")", value: ")" },
  { name: ".", value: "." },
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
]);

// 选中的元素
const items = ref([]);
const handleItemClicked = (item) => {
  items.value.push(item);
};
const handleWidgetClicked = (widget) => {
  items.value.push({ name: widget.label, value: widget.name });
};
const handleBackClicked = () => {
  items.value.pop();
};
const handleClearClicked = () => {
  items.value = [];
};

// 校验计算公式格式是否正确
const formulaVerify = (widgets, elements) => {
  let widgetNames = widgets.map((item) => item.name);
  let exp = elements
    .map((item) => {
      let { value } = item;
      return widgetNames.includes(value) ? "1.0" : value;
    })
    .join("");

  let verified = true;
  try {
    if (exp) {
      let result = eval(exp);
      verified = result != Infinity && isNumber(result);
    }
  } catch (e) {
    verified = false;
  }
  return verified;
};

// 监听表单所有的组件变更，
// watch(flowDefinition.flowWidgets, (newVal) => {});

watch(
  () => props.visible,
  (isOpen) => {
    if (isOpen) {
      items.value = ObjectUtil.copy(props.formulaItems || []);
    }
  }
);

watch(
  () => props.widgets,
  (newVal) => {
    console.log("newVal", newVal);
  }
);

// 弹窗按钮
const handleOk = () => {
  let verified = formulaVerify(props.widgets, items.value);
  if (verified) {
    emits("ok", ObjectUtil.copy(items.value));
    handleClose();
  } else {
    Message.error(`算数表达式格式有误！`);
  }
};
const handleClose = () => {
  emits("update:visible", false);
};
</script>

<style lang="less">
.flow-formula-modal {
  .calc-screen {
    padding: 7px;
    background: #f3f3f3;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 7px;

    .calc-items {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      align-content: flex-start;
      gap: 4px;
      min-height: 140px;

      .clac-item {
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        color: #1f2329;
        border: 1px solid #e1e1e1;
        background-color: #fff;
        border-radius: 4px;
        user-select: none;
        font-size: 14px;
      }
    }

    .calc-option {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      z-index: 10;

      .opt-btn {
        cursor: pointer;
        padding: 0 4px;
        border-radius: 4px;
        user-select: none;

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

  .calc-options {
    .item-box {
      margin-top: 20px;

      .title {
        color: #8c8c8c;
        font-variant: tabular-nums;
        user-select: none;
      }

      .item-wrapper {
        margin-top: 4px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        // display: grid;
        // grid-template-columns: repeat(auto-fill, minmax(32px, max-content));

        .arco-btn-icon {
          color: #1f2329;
        }

        .widget-btn {
          padding: 0 10px;
          color: #1f2329;
        }
      }
    }
  }
}
</style>
