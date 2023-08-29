<template>
  <section class="flow-start-box">
    <div class="search-wrapper">
      <a-input placeholder="请输入审批名称搜索" v-model:model-value="flowName" :allow-clear="true" :style="{ width: '280px' }">
        <template #prepend><icon-search /></template>
      </a-input>
    </div>

    <a-card class="empty-flow-box general-card" v-if="groups.length == 0">
      <a-empty />
    </a-card>

    <template v-for="group in filteredFlowGroups">
      <div class="flow-group-box" v-if="group.flowDefinitions && group.flowDefinitions.length > 0">
        <div class="group-header">{{ group.name }}</div>
        <div class="group-body">
          <a-card hoverable v-for="flow in group.flowDefinitions" class="flow-item-box" @click="onFlowClick(flow)">
            <div class="flow-logo">
              <flow-icon :icon="flow.icon" :size="44" />
              <div class="name-desc">
                <span class="name">{{ flow.name }}</span>
                <span class="desc">{{ flow.remark }}</span>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </template>

    <a-drawer
      :width="500"
      :visible="visible"
      :mask-closable="false"
      :closable="false"
      unmountOnClose
      :header="false"
      :footer="false"
      @cancel="onClose()">
      <template #title> {{ selectedFlow.name }} </template>
      <flow-form :flow="selectedFlow" :flowWidgets="flowWidgets" @onCancel="onClose()" @onSuccess="onClose()"></flow-form>
    </a-drawer>
  </section>
</template>

<script setup>
import { computed, onBeforeMount, ref } from "vue";
import FlowIcon from "@/components/icons/FlowIcon.vue";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import FlowForm from "./flow-form.vue";
import { IconSearch } from "@arco-design/web-vue/es/icon";

let visible = ref(false); // 侧边栏
let selectedFlow = ref({}); // 选中的流程
let flowWidgets = ref([]); // 选中的流程的组件
let flowForm = ref({}); // 流程的表单

// 检索的流程名称
let flowName = ref("");
let filteredFlowGroups = computed(() => {
  return ObjectUtil.copy(groups.value).filter((group) => {
    let { flowDefinitions: flows } = group;
    group.flowDefinitions = (flows || []).filter((flow) => flow.name.includes(flowName.value));
    return flows.length > 0;
  });
});

// 流程定义点击
const onFlowClick = (flow) => {
  flowWidgets.value = [];
  fetchFlowForm(flow.id); // 加载组件
  selectedFlow.value = flow;
  visible.value = true;
};

// 查询流程表单
const fetchFlowForm = (flowDefId) => {
  FlowManApi.getFlowForm({ flowDefId }).then((resp) => {
    if (resp.code == 1) {
      flowWidgets.value = resp.data || [];
    }
  });
};

const onClose = () => {
  visible.value = false;
};

// 加载流程
let groups = ref([]);
const loadGroups = () => {
  FlowManApi.listGroupsWithEnabledFlowDefinition().then((resp) => {
    if (resp.code == 1) {
      groups.value = resp.data || [];
    }
  });
};

onBeforeMount(() => {
  loadGroups();
  OrganApi.loadOrgan();
});
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

@FlowCardGutter: 16px;

.flow-start-box {
  width: 100%;
  height: calc(100vh - @HeaderHeight - @BreadcrumbHeight);
  overflow: hidden;
  overflow-y: auto;
  padding: 0 @ContentPadding;

  .search-wrapper {
    padding: 12px;
    border: 1px solid var(--preview-color-border);
    border-radius: @CommonBorderRedius;
    background: #fff;
  }

  .empty-flow-box {
    margin-top: 16px;
    padding: 48px;
    border-radius: @CommonBorderRedius;
  }

  .flow-group-box {
    margin-top: 16px;
    background-color: #fff;
    border-radius: @CommonBorderRedius;
    overflow: hidden;
    border: 1px solid var(--preview-color-border);

    &:last-of-type {
      margin-bottom: 16px;
    }

    .group-header {
      height: 46px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--color-neutral-3);
      display: flex;
      align-items: center;
    }

    .group-body {
      padding: @FlowCardGutter;
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, 236px);
    }

    .flow-item-box {
      cursor: pointer;
      border-radius: @CommonBorderRedius;
      border-color: var(--color-neutral-3);

      &:hover {
        box-shadow: 4px 4px 12px rgb(var(--gray-3));
      }

      .flow-logo {
        display: flex;
        flex-direction: row;
        align-items: center;
        overflow: hidden;
        user-select: none;

        .name-desc {
          display: flex;
          flex-direction: column;
          max-width: 400px;
          margin-left: 10px;
          flex: 1;

          .desc {
            font-size: 13px;
            width: 140px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            line-height: 17px;
            color: #8f959e;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>
