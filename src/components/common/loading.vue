<template>
  <div class="global-loading">
    <a-spin tip="This may take a while..." />
  </div>
</template>

<script setup>
let props = defineProps({
  loading: { type: Boolean, default: false },
});

// app.directive("loading", {
//   mounted: (el, binding, vnode, prevVnode) => {},
//   updated(el, binding, vnode, prevVnode) {
//     console.log("绑定的元素", el);
//     console.log("参数", binding);
//     let { val: loading, instance } = binding;
//   },
// });

// const vm = binding.instance;
// const resolveExpression = (key) => {
//   const data = (ObjectUtil.isString(key) && vm?.[key]) || key;
//   return data ? ref(data) : data; // 如果data有值则包裹ref
// };
// const getBindingProp = (key) => (ObjectUtil.isObject(binding.value) ? binding.value[key] : undefined);
// const getProp = (name) => resolveExpression(getBindingProp(name) || el.getAttribute(`loading-${ObjectUtil.hyphenate(name)}`));

// const fullscreen = getBindingProp("fullscreen") ?? binding.modifiers.fullscreen;
// const options = {
//   text: getProp("text"),
//   svg: getProp("svg"),
//   svgViewBox: getProp("svgViewBox"),
//   spinner: getProp("spinner"),
//   background: getProp("background"),
//   customClass: getProp("customClass"),
//   fullscreen,
//   target: getBindingProp("target") ?? (fullscreen ? undefined : el),
//   body: getBindingProp("body") ?? binding.modifiers.body,
// };
</script>

<style lang="less" scoped>
.global-loading {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  // background: rgba($color: #ffffff, $alpha: 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
  color: #335dfd;
}
</style>
