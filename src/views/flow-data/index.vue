<template>
  <div class="flow-data-container">
    <!-- 检索区域 -->
    <div class="search-area">
      <div class="search-list">
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
          <a-popover position="rt" trigger="click" :show-arrow="false" class="flow-search-more-popover" animation-name="riro">
            <a-button> <icon-filter /> </a-button>
            <template #content>
              <!-- 更多检索条件 -->
              <div class="search-more-title">高级筛选</div>
              <div class="search-more-box">
                <a-select v-model:model-value="query.initiatorId" allow-clear allow-search placeholder="发起人">
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
      <div class="btns-list">
        <a-tooltip content="导出">
          <a-button :disabled="true"> <icon-export /> </a-button>
        </a-tooltip>
      </div>
    </div>

    <div class="flow-inst-area">
      <div class="flow-table-content">
        <a-table
          :scrollbar="false"
          :bordered="false"
          :hoverable="false"
          :data="flowInsts"
          :pagination="false"
          :loading="tableLoading"
          @page-change="onSearch"
          :scroll="{ maxHeight: 'calc(100vh - 227px)', x: 1000 }">
          <template #columns>
            <a-table-column title="审批名称" data-index="name"></a-table-column>
            <a-table-column title="申请编号" data-index="id" :width="180"></a-table-column>
            <a-table-column title="发起人" :width="120">
              <template #cell="{ record }"> <flow-node-avatar :size="20" :id="record.initiatorId"></flow-node-avatar></template>
            </a-table-column>
            <a-table-column title="状态" :width="100">
              <template #cell="{ record }">
                <a-tag color="blue" v-if="record.status == STATUS.UNDERWAY">{{ STATUS_LIST[0].name }}</a-tag>
                <a-tag color="green" v-else-if="record.status == STATUS.APPROVED">{{ STATUS_LIST[1].name }}</a-tag>
                <a-tag color="red" v-else-if="record.status == STATUS.REJECTED">{{ STATUS_LIST[2].name }}</a-tag>
                <a-tag color="orangered" v-else-if="record.status == STATUS.CANCELLED">{{ STATUS_LIST[3].name }}</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="提交时间" data-index="beginTime" :width="170"></a-table-column>
            <a-table-column title="完成时间" data-index="endTime" :width="170"></a-table-column>
            <a-table-column title="操作" :width="120" fixed="right">
              <template #cell="{ record }">
                <a-link @click="onDetailOpen(record)"> 详情 </a-link>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      <div class="fenye" v-if="query.total > 0">
        <a-pagination show-total @change="onSearch" :total="query.total" :page-size="query.size" :current="query.page" />
      </div>
    </div>

    <!-- 流程详情侧边栏 -->
    <a-drawer
      class="flow-card-detail-drawer"
      :width="770"
      :visible="showDetail"
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
import { computed, onBeforeMount, onMounted, ref } from "vue";
import { useOrganStore } from "@/stores";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import FlowDetail from "../my-flow/flow-detail.vue";
import { STATUS, STATUS_LIST } from "@/components/flow/common/FlowConstant";
import { IconExport, IconFilter, IconRefresh, IconSearch } from "@arco-design/web-vue/es/icon";
import FlowInstApi from "@/api/FlowInstApi";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";

const organStore = useOrganStore();
const users = computed(() => organStore.users);
const groups = ref([]);
const flowBeginTime = ref([]);
const flowEndTime = ref([]);
const flowInsts = ref([]);
const tableLoading = ref(false);
const query = ref({ page: 1, size: 10, total: 0 });

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

const onSearch = (page) => {
  if (page) query.value.page = page;
  tableLoading.value = true;
  FlowInstApi.listFlowInsts(query.value)
    .then((resp) => {
      if (resp.code == 1) {
        flowInsts.value = resp.data || [];
        query.value.total = resp.total || 0;
      }
      tableLoading.value = false;
    })
    .catch(() => (tableLoading.value = false));
};

const onSearchReset = () => {
  query.value = { page: 1, size: 10, total: 0 };
  flowBeginTime.value = null;
  flowEndTime.value = null;
  flowInsts.value = [];
  onSearch();
};

const loadFlowGroups = () => {
  FlowManApi.listGroups().then((resp) => {
    if (resp.code == 1) {
      groups.value = resp.data || [];
    }
  });
};

// 流程详情
const showDetail = ref(false);
let inst = ref({});
const onDetailOpen = (flowInst) => {
  inst.value = flowInst;
  showDetail.value = true;
};
const onDetailClose = () => {
  showDetail.value = false;
};

onMounted(() => {
  onSearch();
});

onBeforeMount(() => {
  OrganApi.loadOrgan();
  loadFlowGroups();
});
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

@SearchHeight: 55px;
@SearchItemGap: 10px;

.flow-data-container {
  user-select: none;
  height: calc(100vh - @AppHeaderHeight - @AppBreadcrumbHeight);
  margin: 0 @LayoutGap;
  padding: 0 @Gap;
  background: #fff;
  border-radius: @BorderRadius;

  .search-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: @SearchItemGap;
    height: @SearchHeight;

    .search-list {
      display: flex;
      align-items: center;

      .search-segment + .search-segment {
        margin-left: 4px;
      }
    }

    .arco-btn {
      padding: 0;
      width: 32px;
    }

    .btns-list {
      display: flex;
      flex-flow: row nowrap;
      gap: @SearchItemGap;
    }
  }

  .flow-inst-area {
    height: calc(100vh - @AppHeaderHeight - @AppBreadcrumbHeight - @SearchHeight);
    overflow: hidden;
    border-top: 1px solid var(--color-neutral-3);

    .flow-table-content {
      margin-top: 12px;
    }
  }
}
</style>
