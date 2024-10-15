<template>
  <a-modal :visible="isOpened" modal-class="new-model-box" ok-text="保存" @ok="onSaveGroup()" @cancel="close()">
    <template #title> 流程复制 </template>
    <div>
      <a-form :model="flowDefCopy" :rules="modelRules" ref="modelFormRef">
        <a-form-item field="name" label="流程名称" required>
          <a-input v-model="flowDefCopy.name" :max-length="16" placeholder="请输入复制后的流程名称" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import FlowManApi from "@/api/FlowManApi";
import { Notification } from "@arco-design/web-vue";
import { ref } from "vue";

let emits = defineEmits(["ok"]);
const props = defineProps({
  flowDef: { type: Object, default: {} }, // 待复制的流程
});

const isOpened = ref(false);
const flowDefCopy = ref({}); // 流程复制对象
const modelFormRef = ref();
const modelRules = ref({
  name: { required: true, message: "复制后的流程名称不能为空", minLength: 1 },
});
const onSaveGroup = () => {
  modelFormRef.value.validate((err) => {
    if (err) return;
    flowDefCopy.value.flowDefId = props.flowDef.id;
    FlowManApi.copy(flowDefCopy.value).then((resp) => {
      if (resp.code == 1) {
        emits("ok", resp.data);
        Notification.success("流程复制成功");
      }
    });
    close();
  });
};
const show = () => {
  isOpened.value = true;
};
const close = () => {
  isOpened.value = false;
  modelFormRef.value.resetFields();
};

defineExpose({ show, close });
</script>
