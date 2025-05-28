<template>
  <div v-if="inst" :class="['flow-card-box', hoverable ? 'flow-card-box-hoverable' : null]" @click="onCardClick()">
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
        <flow-node-avatar :size="20" :id="inst.initiatorId" />
      </div>
      <div class="begin-time">提交于 {{ inst.beginTime }}</div>
    </div>

    <!-- 流程详情侧边栏 -->
    <a-drawer
      v-if="clickable"
      class="flow-card-detail-drawer"
      :width="770"
      :visible="flowDetailVisible"
      @ok="onDetailClose()"
      @cancel="onDetailClose()"
      unmountOnClose
      :footer="false"
      :header="false">
      <flow-detail v-model:flow-inst="inst" :cancelable="false" :actionable="false" :commentable="false" />
    </a-drawer>
  </div>
</template>

<script setup>
import FlowInstApi from "@/api/FlowInstApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { STATUS_LIST } from "@/components/flow/common/FlowConstant";
import { ref, watch } from "vue";
import FlowDetail from "./flow-detail.vue";

const props = defineProps({
  flowInst: { type: Object, default: null },
  flowInstId: { type: String, default: null },
  clickable: { type: Boolean, default: false },
  hoverable: { type: Boolean, default: true },
});

const inst = ref(null);
watch(
  props,
  (nv) => {
    let id = props.flowInstId;
    if (id) {
      FlowInstApi.getById({ flowInstId: id }).then((resp) => {
        if (resp.code == 1) inst.value = resp.data || {};
      });
    } else {
      inst.value = nv.flowInst || {};
    }
  },
  { immediate: true, deep: true }
);

// 流程详情
const flowDetailVisible = ref(false);
const onCardClick = () => {
  if (props.clickable) flowDetailVisible.value = true;
};
const onDetailClose = () => {
  flowDetailVisible.value = false;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.flow-card-box {
  user-select: none;
  border-radius: @BorderRadius;
  overflow: hidden;
  border: 1px solid #e9ebef;
  padding: 10px 12px;
  cursor: pointer;
  transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);
  // scroll-snap-align: start;
  // scroll-snap-type: y mandatory;

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

.flow-card-box-hoverable {
  &:hover {
    box-shadow: 4px 4px 12px rgb(var(--gray-3));
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
