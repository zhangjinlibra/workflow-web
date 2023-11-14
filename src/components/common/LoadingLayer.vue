<template>
  <transition name="fade" mode="out-in">
    <div v-if="loading" :class="['v-loading-mask', fullscreen ? 'is-fullscreen' : '']" :style="maskStyle">
      <svg-icon v-if="icon" :icon-class="icon"></svg-icon>
      <a-spin v-else :tip="text ?? '加载中...'" />
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  text: { type: String },
  background: { type: String },
  icon: { type: String },
  fullscreen: { type: Boolean, default: false },
});

const maskStyle = ref({
  backgroundColor: props.background ?? "hsla(0, 0%, 100%, 0.8)",
});

const loading = ref(false);

const close = () => {
  loading.value = false;
};
const show = () => {
  loading.value = true;
};

defineExpose({ show, close });
</script>

<style lang="less" scoped>
.v-loading-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  padding: 0;
  // background-color: hsla(0, 0%, 100%, 0.9);
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;
}

.is-fullscreen {
  position: fixed;
}
</style>
