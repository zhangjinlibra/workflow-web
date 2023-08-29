<template>
  <a-modal :visible="showAddGroup" modal-class="new-group-box" ok-text="保存" @ok="onSaveGroup()" @cancel="close()">
    <template #title> 新建流程分组 </template>
    <div>
      <a-form :model="group" :rules="newGroupRules" ref="newGroupFormRef">
        <a-form-item field="name" label="分组名称" required="">
          <a-input v-model="group.name" :max-length="16" placeholder="请输入流程分组名称" />
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, toRaw } from "vue";
import { Notification } from "@arco-design/web-vue";
import FlowManApi from "@/api/FlowManApi";

let emits = defineEmits(["ok"]);
const props = defineProps({
  group: { type: Object, default: {} },
});

let showAddGroup = ref(false);
const newGroupFormRef = ref();
const newGroupRules = ref({
  name: { required: true, message: "分组名称不能为空", minLength: 1 },
});
const onSaveGroup = () => {
  newGroupFormRef.value.validate((err) => {
    if (err) return;
    FlowManApi.saveOrUpdateGroup(toRaw(props.group)).then((resp) => {
      if (resp.code == 1) {
        emits("ok", resp.data);
        Notification.success("分组新建成功");
      }
    });
    close();
  });
};
const show = () => {
  showAddGroup.value = true;
};
const close = () => {
  showAddGroup.value = false;
  newGroupFormRef.value.resetFields();
};

defineExpose({ show, close });
</script>
