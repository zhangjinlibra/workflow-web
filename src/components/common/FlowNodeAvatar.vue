<!-- 流程节点头像 -->
<template>
  <div class="avatar" :style="AvatarStyle">
    <a-avatar :size="size" class="icon" :image-url="user.avatar" v-if="user && user.avatar" />
    <a-avatar :size="size" class="icon" v-else> <icon-user /> </a-avatar>
    <div class="name" :style="NameStyle" v-if="showName && user && user.name">{{ user.name }}</div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeMount } from "vue";
import { getUserDetail } from "@/api/OrganApi";
import { IconUser } from "@arco-design/web-vue/es/icon";

let user = ref({});

const props = defineProps({
  size: { type: Number, default: 32 },
  id: { type: String, default: "" },
  showName: { type: Boolean, default: true },
});

watch(
  () => props.id,
  () => loadUserDetail()
);

const loadUserDetail = () => {
  getUserDetail({ userId: props.id }).then((resp) => {
    if (resp.code == 1) {
      user.value = resp.data || [];
    }
  });
};

let AvatarStyle = computed(() => {
  let padding = props.showName ? 4 : 0;
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

onBeforeMount(() => {
  loadUserDetail();
});
</script>

<style lang="less" scoped>
.avatar {
  background: #f2f4f5;
  display: flex;
  align-items: center;

  .icon {
    overflow: hidden;
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
