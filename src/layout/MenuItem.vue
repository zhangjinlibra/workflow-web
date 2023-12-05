<template>
  <template v-if="!item.hidden">
    <a-menu-item v-if="hasOneShowingChild(item)" :key="onlyOneChild.path" class="nest-menu">
      {{ onlyOneChild.meta.title }}
      <template #icon v-if="!isNest">
        <div class="icon"><svg-icon :icon-class="onlyOneChild.meta.icon" /></div>
      </template>
    </a-menu-item>
    <template v-else>
      <a-sub-menu :key="item.path">
        <template #icon v-if="!isNest">
          <div class="icon"><svg-icon :icon-class="item.meta.icon" /></div>
        </template>
        <template #title>{{ item.meta.title }}</template>
        <MenuItem v-for="child in item.children" :item="child" :is-nest="true"></MenuItem>
      </a-sub-menu>
    </template>
  </template>
</template>

<script>
export default { name: "MenuItem" };
</script>

<script setup>
import { ref } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
  isNest: { type: Boolean, default: false },
});

const onlyOneChild = ref({});
const hasOneShowingChild = (parent) => {
  const { children, meta } = parent;
  const showingChildren = (children || []).filter((item) => !item.hidden);
  if (showingChildren.length > 1) {
    return false;
  } else {
    if (showingChildren.length === 0) {
      onlyOneChild.value = parent;
    } else if (showingChildren.length === 1) {
      onlyOneChild.value = { ...showingChildren[0], meta };
    }
    return true;
  }
};
</script>

<style lang="less" scoped>
@IconSize: 18px;

.arco-menu-icon {
  .icon {
    width: @IconSize;
    height: @IconSize;
    display: flex;
    align-items: center;
    justify-content: center;

    .svg-icon {
      width: @IconSize;
      height: @IconSize;
    }
  }
}
</style>
