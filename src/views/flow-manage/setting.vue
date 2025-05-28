<template>
  <section class="fd-setting-box">
    <div class="setting-main-panel">
      <a-form :model="flowDef" :auto-label-width="true" :style="{ width: '600px' }">
        <div class="setting-name">提交人权限</div>
        <a-form-item
          field="cancelable"
          tooltip="第一个审批节点通过后，提交人仍可撤销申请（配置前已发起的申请不生效）"
          label="允许撤销审批中的申请">
          <a-switch v-model="flowDef.cancelable" type="round" :checked-value="1" :unchecked-value="0" />
        </a-form-item>
        <a-form-item> <div style="clear: both"></div></a-form-item>
      </a-form>
    </div>
  </section>
</template>

<script setup>
import { useFlowStore } from "@/stores/index";
import { onMounted, ref } from "vue";

let { flowDefinition, setFlowDef } = useFlowStore();
let flowDef = ref({});

onMounted(() => {
  flowDef.value = flowDefinition.workFlowDef;
});
</script>

<style lang="less" scoped>
.fd-setting-box {
  padding: 15px 0 10px;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  height: 100%;

  .setting-main-panel {
    background-color: #fff;
    width: 600px;
    border-radius: var(--border-radius-large);
    display: flex;
    justify-content: center;
    padding: 24px 40px 0;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;

    .setting-name {
      width: 94px;
      color: #1f2329;
      font-size: 14px;
      font-weight: 550;
      line-height: 22px;
      flex-shrink: 0;
      flex-grow: 0;
      margin-bottom: 10px;
    }
  }
}
</style>
