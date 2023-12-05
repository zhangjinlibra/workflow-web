<template>
  <div class="flow-icon-box" :style="boxStyle">
    <img v-if="icon" :src="ICON_BASE_URL + icon" :style="boxStyle" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ICON_BASE_URL } from "@/api/IconApi";

let props = defineProps({
  icon: {
    type: String,
    default: null,
  },
  size: {
    type: Number,
    default: 48,
  },
});

let boxStyle = computed(() => {
  return {
    width: props.size + "px",
    height: props.size + "px",
  };
});
</script>

<style lang="less">
.flow-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
</style>
