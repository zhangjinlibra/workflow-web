<!-- 可编辑的文本 -->
<template>
  <div :class="['editable-text-box', hoverable ? 'editable-text-box-hoverable' : null]" @click="onClick()">
    <div v-if="showText" class="text-box">
      <div class="text">{{ value }}</div>
      <div class="icon"><icon-edit /></div>
    </div>
    <div v-else class="input-box">
      <a-input ref="valueModel" v-model:model-value="text" @blur="onLeave()" :max-length="16" />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { IconEdit } from "@arco-design/web-vue/es/icon";

let showText = ref(true);
let valueModel = ref();
let text = ref("");
let emits = defineEmits(["update:value", "change"]);
let props = defineProps({
  value: { type: String, default: "" },
  hoverable: { type: Boolean, default: false },
});

const onClick = () => {
  showText.value = false;
  text.value = props.value;
  nextTick(() => {
    valueModel.value.focus();
  });
};
const onLeave = () => {
  showText.value = true;
  // emits("update:value", text.value);
  emits("change", text.value);
};
</script>

<style lang="less" scoped>
.editable-text-box {
  width: 100%;
  min-width: 200px;

  .text-box {
    border: 1px solid transparent;
    padding: 4px 12px;
    color: var(--color-text-1);
    font-size: 14px;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    transition: 0.5s;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 31.6px;

    &:hover {
      border-color: #d9d9d9;
    }
  }

  .input-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.editable-text-box-hoverable {
  .text-box {
    justify-content: space-between;

    &:hover {
      border-color: #d9d9d9;

      .icon {
        opacity: 1;
      }
    }

    .icon {
      opacity: 0;
      transition: opacity 0.3s;
    }
  }
}
</style>
