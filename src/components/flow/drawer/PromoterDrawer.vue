<template>
  <a-drawer
    :append-to-body="true"
    :width="540"
    title="发起人"
    :visible="visible"
    :closable="false"
    @ok="savePromoter()"
    @cancel="closeDrawer()"
    ok-text="保存">
    <!-- 发起人设置 -->
    <!-- <div class="approval-editor-tab-wrapper">
      <a-radio-group v-model="viewEditorType" type="button" size="large">
        <a-radio :value="0">基础设置</a-radio>
        <a-radio :value="1">表单权限</a-radio>
      </a-radio-group>
    </div> -->

    <div class="approval-editor-content">
      <!-- 发起人设置 -->
      <div class="item-content-editor" v-if="viewEditorType == 0">
        <div class="content-wrap">
          <div class="item-content">
            <div class="type-prompt">谁可以发起该审批</div>
            <a-select class="type-content" v-model="flowPermission.type" @change="handleInitiatorTypeChange" placeholder="请选择">
              <a-option :value="0">全员</a-option>
              <a-option :value="1">指定人员</a-option>
              <a-option :value="2">均不可提交</a-option>
            </a-select>
            <template v-if="flowPermission.type == 1">
              <div class="selected-content">
                <div class="selected-list">
                  <a-tag v-for="item in selected">{{ getById(item.id).name }}</a-tag>
                </div>
                <div class="btn" @click="openInitiatorChooseBox()">
                  <a-link>
                    <template #icon><icon-plus /></template>添加
                  </a-link>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>

  <OrganChooseBox v-model:visible="initiatorChooseBoxVisible" v-model:selected="selected" :only-id="false" />
</template>

<script setup>
import { computed, ref, watch, toRaw } from "vue";
import { useFlowStore, useOrganStore } from "@/stores/index";
import OrganChooseBox from "../dialog/OrganChooseBox.vue";
import { IconPlus } from "@arco-design/web-vue/es/icon";

let initiatorChooseBoxVisible = ref(false);
let selected = ref([]); // 发起人选项

let flowStore = useFlowStore();
let { getById } = useOrganStore();
let { showPromoterDrawer, setPromoterConfig } = flowStore;
let isPromoterDrawerOpened = computed(() => flowStore.isPromoterDrawerOpened);
let promoterConfig0 = computed(() => flowStore.promoterConfig0);
let visible = computed({
  get: () => isPromoterDrawerOpened.value,
  set: () => closeDrawer(),
});

let viewEditorType = ref(0); // 界面编辑类型
let _uid = ref(0);
let flowPermission = ref({ type: 0 });

const openInitiatorChooseBox = () => {
  initiatorChooseBoxVisible.value = true;
};

const handleInitiatorTypeChange = (type) => {
  if (type != 1) selected.value = []; //清除指定人员
};

watch(promoterConfig0, (newVal) => {
  flowPermission.value = newVal.value;
  selected.value = newVal.value.flowInitiators;
  _uid = newVal.id;
});

const savePromoter = () => {
  flowPermission.value.flowInitiators = selected.value;
  setPromoterConfig({
    value: toRaw(flowPermission.value),
    flag: true,
    id: _uid,
  });
  closeDrawer();
};

const closeDrawer = () => {
  showPromoterDrawer(false);
};
</script>

<style lang="less">
.approval-editor-tab-wrapper {
  user-select: none;
  margin-bottom: 24px;

  .arco-radio-group-button {
    width: 100%;

    .arco-radio-button {
      flex: 1;
      text-align: center;
    }
  }
}

.approval-editor-content {
  .item-content-editor {
    user-select: none;
    margin-top: 0;

    .type-content {
      margin-top: 8px;
    }

    .selected-content {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 4px;

      .selected-list {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
}
</style>
