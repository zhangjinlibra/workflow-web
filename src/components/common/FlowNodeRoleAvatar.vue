<!-- 流程节点角色 -->
<template>
  <div class="avatar" :style="AvatarStyle">
    <a-avatar :size="size" class="icon">
      <icon-user-group :size="size" />
    </a-avatar>
    <div class="name" :style="NameStyle">{{ role.name }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeMount } from "vue";
import { useOrganStore } from "@/stores";
import ArrayUtil from "../flow/common/ArrayUtil";
import { IconUserGroup } from "@arco-design/web-vue/es/icon";

let { roles: allRoles } = useOrganStore();
let role = computed(() => {
  return ArrayUtil.get(allRoles, "id", props.id);
});

const props = defineProps({
  size: { type: Number, default: 32 },
  id: { type: String, default: "" },
});

let AvatarStyle = computed(() => {
  let padding = 4;
  return {
    height: props.size + padding * 2 + "px",
    borderRadius: (props.size + padding * 2) / 2 + "px",
    padding: padding + "px",
  };
});

let NameStyle = computed(() => {
  return {
    fontSize: props.size / 2 + 1 + "px",
  };
});

onBeforeMount(() => {});
</script>

<style lang="less" scoped>
.avatar {
  background: #f2f4f5;
  display: flex;
  align-items: center;

  .icon {
    overflow: hidden;
    background-color: #2a5eff;
  }

  .name {
    user-select: none;
    font-family: PingFangSC-Regular, PingFang SC;
    color: #34383e;
    margin: 0 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 64px;
  }
}
</style>
