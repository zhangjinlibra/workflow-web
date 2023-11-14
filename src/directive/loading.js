import LoadingLayer from "@/components/common/LoadingLayer.vue";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { createApp } from "vue";

const afterLeave = (callback, speed = 200) => {
  let called = false;
  const afterLeaveCallback = function () {
    if (called) return;
    called = true;
    if (callback) callback.apply(null);
  };
  setTimeout(() => {
    afterLeaveCallback();
  }, speed + 100);
};

const vLoading = {
  mounted: (el, binding) => {
    const vm = binding.instance;
    const resolveExpression = (key) => (ObjectUtil.isString(key) && vm?.[key]) || key;
    const getBindingProp = (key) => (ObjectUtil.isObject(binding.value) ? binding.value[key] : undefined);
    const getProp = (name) => resolveExpression(getBindingProp(name) || el.getAttribute(`loading-${ObjectUtil.hyphenate(name)}`));

    //获取一些标签的自定义属性
    const text = getProp("text");
    const background = getProp("background");
    const icon = getProp("icon");
    const { fullscreen } = binding.modifiers;

    // 根据 LoadingLayer 组件创建 spin 对象
    const spin = createApp(LoadingLayer, { text, background, icon, fullscreen });

    // 动态创建⼀个 div 节点，将 spin 挂载在 div 上
    // 我们的 spin 组件将替换此 div 标签
    const instance = spin.mount(document.createElement("div"));
    // const instance = document.createElement("div");
    // render(spin, instance);

    // 因为在 updated 也需要⽤到 instance 所以将 instance 添加在 el 上
    // 在 updated 中 通过 el.instance 可访问到
    el.instance = instance;

    let container = fullscreen ? document.body : el;

    // v-loading 传过来的值储存在 binding.value 中
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        container.appendChild(el.instance.$el);
        el.instance.show();
      }
    }
  },
  updated: (el, binding) => {
    const { fullscreen } = binding.modifiers;
    let container = fullscreen ? document.body : el;

    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        container.appendChild(el.instance.$el);
        el.instance.show();
      } else {
        afterLeave(() => container.removeChild(el.instance.$el));
        el.instance.close();
      }
    }
  },
};

export default vLoading;
