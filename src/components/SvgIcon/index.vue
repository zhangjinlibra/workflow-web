<template>
  <div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" />
  <svg v-else :class="svgClass" aria-hidden="true">
    <use v-if="color" :xlink:href="iconName" :fill="color" />
    <use v-else :xlink:href="iconName" />
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  iconClass: { type: String, required: true },
  className: { type: String, default: "" },
  color: { type: String }, // #333
});

const isExternal = computed(() => {
  let isExternal = /^(https?:|mailto:|tel:)/.test(props.iconClass);
  return isExternal;
});

const iconName = computed(() => {
  return `#icon-${props.iconClass}`;
});

const svgClass = computed(() => {
  return props.className ? `svg-icon ${props.className}` : "svg-icon";
});

const styleExternalIcon = computed(() => {
  return {
    mask: `url(${props.iconClass}) no-repeat 50% 50%`,
    // "-webkit-mask": `url(${props.iconClass}) no-repeat 50% 50%`,
  };
});
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
