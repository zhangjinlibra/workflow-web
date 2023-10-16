<template>
  <div>
    <a-modal
      v-if="isOpened"
      v-model:visible="isOpened"
      modal-class="flow-select-container"
      @ok="onOkClicked()"
      @cancel="onCancelClicked()"
      titleAlign="start"
      :width="890">
      <template #title> 请选择关联审批 </template>

      <div class="flow-select-body">
        <div class="flow-tabs">
          <a-radio-group v-model="activeKey" size="large" type="button" @change="onTabChanged">
            <a-radio v-for="tab in tabs" :value="tab.key">{{ tab.title }}</a-radio>
          </a-radio-group>

          <!-- 检索条件 -->
          <div class="search-box">
            <div class="search-segment" style="width: 225px">
              <a-input-search
                v-model="query.name"
                :max-length="16"
                allow-clear
                placeholder="流程名称"
                search-button
                :button-props="{ type: 'secondary' }"
                long
                @press-enter="onSearch()"
                @search="onSearch()">
                <template #button-icon><icon-search /></template>
              </a-input-search>
            </div>
            <div class="search-segment">
              <a-tooltip content="重置">
                <a-button @click="onSearchReset()"> <icon-refresh /> </a-button>
              </a-tooltip>
            </div>
            <div class="search-segment">
              <a-popover position="br" trigger="click" :show-arrow="false" class="flow-search-more-popover" animation-name="uido">
                <a-button> <icon-filter /> </a-button>
                <template #content>
                  <!-- 更多检索条件 -->
                  <div class="search-more-title">高级筛选</div>
                  <div class="search-more-box">
                    <a-select
                      v-model:model-value="query.initiatorId"
                      v-if="![tabs[1].key].includes(activeKey)"
                      allow-clear
                      allow-search
                      placeholder="发起人">
                      <a-option v-for="user in users" :value="user.id" :label="user.name" />
                    </a-select>
                    <a-select class="column" v-model:model-value="query.groupId" allow-clear placeholder="流程分组">
                      <a-option v-for="group in groups" :value="group.id" :label="group.name" />
                    </a-select>
                    <a-select
                      class="column"
                      v-model:model-value="query.status"
                      allow-clear
                      placeholder="流程状态"
                      @clear="() => delete query.status">
                      <a-option v-for="status in STATUS_LIST" :value="status.value" :label="status.name" />
                    </a-select>
                    <a-range-picker
                      v-model:model-value="flowBeginTime"
                      :placeholder="['最小提交时间', '最大提交时间']"
                      allow-clear
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      @change="onBeginTimeChanged" />
                    <a-range-picker
                      v-if="![tabs[0].key].includes(activeKey)"
                      v-model:model-value="flowEndTime"
                      :placeholder="['最小完成时间', '最大完成时间']"
                      allow-clear
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      @change="onEndTimeChanged" />
                  </div>
                  <div class="search-more-action">
                    <a-button @click="onSearchReset()"> 重置 </a-button>
                    <a-button type="primary" @click="onSearch()"> 检索 </a-button>
                  </div>
                </template>
              </a-popover>
            </div>
          </div>
        </div>

        <div class="flow-list">
          <div class="empty-box" v-if="flowInsts.length == 0">
            <a-empty></a-empty>
          </div>
          <div
            :class="['flow-item', choosedFlowInstIds.includes(flowInst.id) ? 'flow-item-choosed' : '']"
            v-for="flowInst in flowInsts"
            @click="onFlowInstChoosed(flowInst.id)">
            <div class="checkbox"></div>
            <FlowCard :flowInst="flowInst" />
          </div>
          <RollLoading @onScroll="loadFlowInsts()" :has-more="hasMoreFlowInsts"><a-spin></a-spin></RollLoading>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeMount } from "vue";
import FlowApi from "@/api/FlowApi";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";
import FlowCard from "./flow-card.vue";
import ArrayUtil from "lodash/array";
import RollLoading from "@/components/common/RollLoading.vue";
import { IconSearch, IconRefresh, IconFilter } from "@arco-design/web-vue/es/icon";
import { useOrganStore } from "@/stores";
import { STATUS_LIST } from "@/components/flow/common/FlowConstant";

let props = defineProps({ visible: { type: Boolean, default: false }, selected: { type: Array, default: () => [] } });
let emits = defineEmits(["update:visible", "update:selected"]);

// 更多检索相关选项
let organStore = useOrganStore();
let users = computed(() => organStore.users);
let groups = ref([]);

// tab控制
let tabs = ref([
  { key: 1, title: "待审批" },
  { key: 2, title: "我的申请" },
  { key: 3, title: "我收到的" },
  { key: 4, title: "已审批" },
]);
let activeKey = ref(tabs.value[0].key);
const onTabChanged = (key) => {
  query.value.page = 0;
  query.value.size = 10;
  query.value.total = 0;
  hasMoreFlowInsts.value = true;
  flowInsts.value = [];
};

// 流程列表
let query = ref({ page: 0, size: 10, total: 0 });
let hasMoreFlowInsts = ref(true); // 是否存在更多的流程
let flowInsts = ref([]);
let choosedFlowInstIds = ref([]);
const loadFlowInsts = () => {
  let req = null;
  query.value.page++;
  switch (activeKey.value) {
    case tabs.value[0].key:
      req = FlowApi.listTasks(query.value);
      break;
    case tabs.value[1].key:
      req = FlowApi.listMineFlowInsts(query.value);
      break;
    case tabs.value[2].key:
      req = FlowApi.listMineFlowInstCcs(query.value);
      break;
    case tabs.value[3].key:
      req = FlowApi.listMineAuditRecords(query.value);
      break;
  }
  req
    .then((resp) => {
      if (resp.code == 1) {
        let { data, total } = resp;
        flowInsts.value.push(...(data || []));
        query.value.total = total;
        if (flowInsts.value.length >= total) {
          hasMoreFlowInsts.value = false;
          console.log(hasMoreFlowInsts.value);
        }
      } else {
        query.value.page--;
      }
    })
    .catch((e) => query.value.page--);
};
const onFlowInstChoosed = (id) => {
  if (choosedFlowInstIds.value.includes(id)) {
    ArrayUtil.remove(choosedFlowInstIds.value, function (v) {
      return v == id;
    });
  } else {
    choosedFlowInstIds.value.push(id);
  }
};

// 检索-更多弹窗
let flowBeginTime = ref([]);
let flowEndTime = ref([]);
const onBeginTimeChanged = (dateString) => {
  if (dateString && dateString.length == 2) {
    query.value.beginMinTime = dateString[0];
    query.value.beginMaxTime = dateString[1];
  } else {
    delete query.value.beginMinTime;
    delete query.value.beginMaxTime;
  }
};
const onEndTimeChanged = (dateString) => {
  if (dateString && dateString.length == 2) {
    query.value.endMinTime = dateString[0];
    query.value.endMaxTime = dateString[1];
  } else {
    delete query.value.endMinTime;
    delete query.value.endMaxTime;
  }
};
const onSearch = () => {
  query.value.page = 0;
  flowInsts.value = [];
  hasMoreFlowInsts.value = true;
};
const onSearchReset = () => {
  query.value = { page: 0, size: 10, total: 0 };
  flowBeginTime.value = null;
  flowEndTime.value = null;
  flowInsts.value = [];
  hasMoreFlowInsts.value = true;
};

// 监听打开事件
watch(
  () => props.visible,
  (nv) => {
    if (nv) {
      choosedFlowInstIds.value = JSON.parse(JSON.stringify(props.selected || []));
      onSearchReset();
    }
  },
  { deep: true, immediate: true }
);

const loadFlowGroups = () => {
  FlowManApi.listGroups().then((resp) => {
    if (resp.code == 1) {
      groups.value = resp.data || [];
    }
  });
};

// 弹窗控制
let isOpened = computed({
  get: () => props.visible,
  set: (val) => emits("update:visible", val),
});

const onOkClicked = () => {
  emits("update:selected", choosedFlowInstIds.value);
  onCancelClicked();
};

const onCancelClicked = () => {
  isOpened.value = false;
};

onBeforeMount(() => {
  OrganApi.loadOrgan();
  loadFlowGroups();
});
</script>

<style lang="less" scoped>
@FlowTabsHeight: 36px;
@SearchBoxHeight: 56px;

.flow-select-container {
  .flow-select-body {
    .flow-tabs {
      height: @FlowTabsHeight;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-box {
        display: flex;
        align-items: center;
        height: @SearchBoxHeight;

        .search-segment + .search-segment {
          margin-left: 4px;
        }

        .arco-btn {
          padding: 0;
          width: 32px;
        }
      }
    }

    .empty-box {
      background-color: #fff;
      padding: 0 16px;
      padding-top: 20%;
    }

    .flow-list {
      width: 100%;
      height: calc(100vh - @FlowTabsHeight - 200px);
      border: 1px solid var(--color-neutral-3);
      border-radius: 4px;
      overflow: hidden auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 14px 8px 10px;

      .flow-item {
        border-radius: 4px;
        border: 1px solid #e9ebef;
        display: flex;
        overflow: hidden;
        flex-shrink: 0;
        transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);

        .checkbox {
          width: 8px;
          height: 100%;
          background-color: #e9ebef;
        }

        .flow-card-box {
          border: 0;
          border-radius: 0;
          flex: 1;
        }

        &:hover {
          box-shadow: 4px 4px 12px rgb(var(--gray-3));
        }
      }

      .flow-item-choosed {
        .checkbox {
          background-color: rgb(var(--link-6));
        }
      }
    }
  }
}
</style>

<style lang="less">
@import "./flow-base.less";

.flow-select-container {
  .arco-modal-body {
    padding: 12px;
  }
}
</style>
