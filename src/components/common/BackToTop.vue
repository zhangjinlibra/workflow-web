<template>
  <a-back-top :target-container="targetContainer" :visible-height="50">
    <a-button shape="circle" class="site-backtop-btn">
      <template #icon> <icon-up /> </template>
    </a-button>
  </a-back-top>
</template>

<script setup>
import { IconUp } from "@arco-design/web-vue/es/icon";

let props = defineProps({ targetContainer: String });
</script>

<style lang="less">
.site-backtop-btn {
  background: var(--color-bg-5) !important;
  border: 1px solid var(--color-fill-3) !important;
  box-shadow: 0 2px 12px #0000001a;
}
</style>
