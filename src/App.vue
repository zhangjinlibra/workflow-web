<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade-transform'" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <!-- 注意：:key="route.path"需要删除，嵌套路由时，如果key变化所有的动画都会渲染，加上会出现重复渲染的情况 -->
  <!-- <component :is="Component" :key="route.path" /> -->
  <!-- <router-view> </router-view> -->
</template>

<script setup></script>
