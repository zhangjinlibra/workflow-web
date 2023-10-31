<template>
  <div class="flow-card-box" @click="onCardClicked()">
    <div class="header">
      <a-typography-text bold class="name">{{ inst.name }}</a-typography-text>
      <div class="status">
        <a-tag color="blue" v-if="inst.status == STATUS_LIST[0].value">{{ STATUS_LIST[0].name }}</a-tag>
        <a-tag color="green" v-else-if="inst.status == STATUS_LIST[1].value">{{ STATUS_LIST[1].name }}</a-tag>
        <a-tag color="red" v-else-if="inst.status == STATUS_LIST[2].value">{{ STATUS_LIST[2].name }}</a-tag>
        <a-tag color="orangered" v-else-if="inst.status == STATUS_LIST[3].value">{{ STATUS_LIST[3].name }}</a-tag>
      </div>
    </div>
    <div class="summary-list">
      <div class="summary-item" v-for="(value, label) in inst.summary">
        <div class="label">{{ label }}：</div>
        <div class="value">{{ value }}</div>
      </div>
    </div>
    <div class="footer">
      <div class="initiator">
        <!-- <a-avatar :size="20" class="avatar">{{ inst.initiatorId }}</a-avatar>
        {{ inst.initiatorId }} -->
        <flow-node-avatar :size="20" :id="inst.initiatorId"></flow-node-avatar>
      </div>
      <div class="begin-time">提交于 {{ inst.beginTime }}</div>
    </div>

    <!-- 流程详情侧边栏 -->
    <a-drawer
      v-if="clickable"
      class="flow-card-detail-drawer"
      :width="770"
      :visible="showDetail"
      @ok="onDetailClose()"
      @cancel="onDetailClose()"
      unmountOnClose
      :footer="false"
      :header="false">
      <flow-detail v-model:flow-inst="inst" :cancelable="false" :actionable="false" />
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import FlowApi from "@/api/FlowApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { STATUS_LIST } from "@/components/flow/common/FlowConstant";
import FlowDetail from "./flow-detail.vue";

let props = defineProps({
  flowInst: { type: Object, default: null },
  flowInstId: { type: String, default: null },
  clickable: { type: Boolean, default: false },
});

let inst = ref({});
watch(
  props,
  (nv) => {
    let id = props.flowInstId;
    if (id) {
      FlowApi.getById({ flowInstId: id }).then((resp) => {
        if (resp.code == 1) inst.value = resp.data || {};
      });
    } else {
      inst.value = nv.flowInst || {};
    }
  },
  { immediate: true, deep: true }
);

// 流程详情
let showDetail = ref(false);
const onCardClicked = () => {
  if (props.clickable) showDetail.value = true;
};
const onDetailClose = () => {
  showDetail.value = false;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.flow-card-box {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e9ebef;
  padding: 10px 12px;
  user-select: none;
  cursor: pointer;
  transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);
  scroll-snap-align: start;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .name {
      font-size: 15px;
    }
  }

  .summary-list {
    margin-top: 10px;

    .summary-item {
      display: flex;
      min-height: 20px;

      .label {
        color: #9ba5b3;
        // width: @FlowCardFieldLabelWidth;
        overflow: hidden;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .value {
        color: #232730;
        // max-width: calc(100% - @FlowCardFieldLabelWidth);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .footer {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;

    .initiator {
      display: flex;
      align-items: center;
    }

    .begin-time {
      color: var(--color-neutral-6);
    }
  }
}
</style>

<style lang="less">
.flow-card-detail-drawer {
  .arco-drawer-body {
    padding: 0;
  }
}
</style>
