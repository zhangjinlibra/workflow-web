<template>
  <kanban></kanban>
  <Gantt2></Gantt2>
</template>

<script>
import { nextTick, computed, defineAsyncComponent } from "vue";
import { debounce } from "lodash-es";

import kanban from "@/components/kanban/Demo.vue";
import Gantt2 from "@/components/gantt/Gantt2.vue";

export default {
  components: {
    kanban,
    Gantt2,
  },
  data() {
    return {};
  },
  provide() {
    return {};
  },
  methods: {},
  mounted() {},
};
</script>

<style scoped></style>
