<template>
  <div ref="spinbox" class="spin-box">
    <!-- 加载图标插槽 -->
    <slot v-if="hasMore"></slot>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const ob = ref();
const spinbox = ref();
const visiable = ref(false); // 元素是否出现在视口
const emits = defineEmits(["onScroll"]);
const props = defineProps({ hasMore: { type: Boolean, default: true } });

// 监听是否还有更多
watch(
  () => props.hasMore,
  (nv) => {
    if (nv) register();
  }
);

// 注册观察器
const register = () => {
  ob.value.unobserve(spinbox.value);
  ob.value.observe(spinbox.value);
};

onMounted(() => {
  const obCallback = (entries) => {
    let entry = entries[0];
    visiable.value = entry.isIntersecting;
    if (visiable.value && props.hasMore) {
      emits("onScroll");
    }
  };

  ob.value = new IntersectionObserver(obCallback, { threshold: 0 });
  ob.value.observe(spinbox.value);
});

onBeforeUnmount(() => {
  ob.value.unobserve(spinbox.value);
});
</script>

<style lang="less">
.spin-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
