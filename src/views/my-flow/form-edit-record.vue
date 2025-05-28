<!-- 表达编辑记录 -->
<template>
  <a-modal
    :width="900"
    :visible="visible"
    :hide-cancel="true"
    :draggable="true"
    @cancel="handleOk"
    @ok="handleOk"
    modal-class="form-edit-record-container">
    <template #title> 审批表单编辑记录 </template>
    <div class="form-edit-list">
      <div class="form-edit-box" v-for="record in formEditRecords">
        <div class="header">
          <flow-node-avatar :size="16" :id="record.creatorId" />
          <div class="modify-time">{{ record.createTime }} 前表单</div>
        </div>
        <div class="content">
          <FlowFormDetail :form-widgets="formWidgets" :form-value="JSON.parse(record.formValue)" :only-value="true" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import FlowInstApi from "@/api/FlowInstApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { ref, watch } from "vue";
import FlowFormDetail from "./flow-form-detail.vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  flowInstId: { type: String },
  formWidgets: { type: Array, default: [] },
});
const emits = defineEmits(["update:visible"]);

const formEditRecords = ref([]);

const listFormEditRecords = () => {
  FlowInstApi.listFormEditRecords({ flowInstId: props.flowInstId }).then((resp) => {
    if (resp.code == 1) {
      formEditRecords.value = resp.data || [];
    }
  });
};

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      listFormEditRecords();
    }
  }
);

const handleOk = () => {
  emits("update:visible", false);
};
</script>

<style lang="less">
.form-edit-record-container {
  height: calc(100% - 50px);
  line-height: 1.15;
  overflow: auto hidden;

  .arco-modal-body {
    height: calc(100% - 112px);
    overflow: hidden auto;
  }

  .form-edit-list {
    .form-edit-box {
      + .form-edit-box {
        border-top: 1px solid var(--color-neutral-3);
        margin-top: 16px;
        padding-top: 16px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      // .modify-time {
      //   font-size: 12px;
      // }
    }
  }
}
</style>
