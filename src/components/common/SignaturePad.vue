<template>
  <!-- 签字板 -->
  <div class="signature-pad-box">
    <Vue3Signature
      class="signature-area"
      ref="signaturePad"
      :disabled="disabled"
      :w="width"
      :h="height"
      :sigOption="{
        dotSize: dotSize,
        minWidth: minWidth,
        maxWidth: maxWidth,
        minDistance: minDistance,
        backgroundColor: backgroundColor,
        penColor: penColor,
        throttle: throttle,
        velocityFilterWeight: velocityFilterWeight,
      }"></Vue3Signature>
    <div class="btn-area">
      <a-button size="small" type="primary" @click="save"> 签署 </a-button>
      <a-button size="small" status="warning" @click="clear"> 清屏 </a-button>
      <!-- <a-button size="small" @click="undo"> 撤销 </a-button> -->
      <!-- <a-button size="small" @click="isEmpty"> isEmpty </a-button> -->
    </div>
  </div>
</template>

<script setup>
import { Message } from "@arco-design/web-vue";
import { ref } from "vue";
import Vue3Signature from "vue3-signature";

// 属性
const props = defineProps({
  // vue3-signature 属性，长宽必须是确定是数值否则签名板不能展示
  width: { type: String },
  height: { type: String },
  disabled: { type: Boolean, default: false },

  // signature-pad 属性
  dotSize: { type: Number, default: 0.5 },
  minWidth: { type: Number, default: 0.5 },
  maxWidth: { type: Number, default: 2.5 },
  minDistance: { type: Number, default: 5 },
  backgroundColor: { type: String, default: "rgb(255,255,255)" },
  penColor: { type: String, default: "black" },
  throttle: { type: Number, default: 16 },
  velocityFilterWeight: { type: Number, default: 0.7 },
});

// 事件
const emits = defineEmits(["ok", "clear"]);

const signaturePad = ref();
const save = (t = "image/png") => {
  if (isEmpty()) {
    Message.error({ title: "签字审批", content: "请先签字！" });
  } else {
    // png: image/png; jpeg: image/jpeg; svg: image/svg+xml
    let base64 = signaturePad.value.save(t);
    console.log("base64", base64);
    emits("ok", base64);
  }
};
const clear = () => {
  signaturePad.value.clear();
  emits("clear");
};
// const undo = () => {
//   signaturePad.value.undo();
// };
const isEmpty = () => {
  return signaturePad.value.isEmpty();
};

defineExpose({ isEmpty });
</script>

<style lang="less">
@import "@/styles/variables.module.less";

.signature-pad-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px dashed var(--color-text-3);
  border-radius: @BorderRadius;

  .signature-area {
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.02) inset;
  }

  .btn-area {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    gap: 8px;
  }
}
</style>
