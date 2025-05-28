<!-- 流程印章 -->
<template>
  <div class="flow-stamp-container">
    <img :style="style" src="@/assets/stamp/approved.svg" v-if="status == STATUS.APPROVED" />
    <img :style="style" src="@/assets/stamp/rejected.svg" v-else-if="status == STATUS.REJECTED" />
    <img :style="style" src="@/assets/stamp/underway.svg" v-else-if="status == STATUS.UNDERWAY" />
    <img :style="style" src="@/assets/stamp/canceled.svg" v-else-if="status == STATUS.CANCELLED" />
  </div>
</template>

<script setup>
import { STATUS } from "@/components/flow/common/FlowConstant";
import { computed } from "vue";

let props = defineProps({
  status: Number,
  size: { type: Number, default: 48 },
});

let style = computed(() => {
  return {
    width: props.size + "px",
    height: props.size + "px",
  };
});
</script>

<style lang="less" scoped>
.flow-stamp-container {
  img {
    overflow: hidden;
    background-color: transparent;
    z-index: 999;
  }
}
</style>
