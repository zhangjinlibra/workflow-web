<template>
  <div class="flow-data-container" v-loading.fullscreen="loading">
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
          <a-button @click="onExport()"> <icon-export /> </a-button>
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
            <a-table-column title="编号" data-index="id" :width="185"></a-table-column>
            <a-table-column title="名称" data-index="name" :width="200"></a-table-column>
            <a-table-column title="摘要" data-index="summary" :width="300">
              <template #cell="{ record }">
                <div class="summary-list">
                  <div class="summary-item" v-for="(value, label) in record.summary">
                    <div class="label">{{ label }}：</div>
                    <div class="value">{{ value }}</div>
                  </div>
                </div>
              </template>
            </a-table-column>
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
            <a-table-column title="操作" :width="140" fixed="right">
              <template #cell="{ record }">
                <div class="btn-box">
                  <a-tooltip content="详情" position="top" mini>
                    <a-button size="small" @click="onDetailOpen(record)">
                      <template #icon> <SvgIcon icon-class="btn-detail" style="font-size: 18px" /> </template>
                    </a-button>
                  </a-tooltip>
                  <template v-if="record.status == STATUS.UNDERWAY">
                    <a-popconfirm position="tr" content="确定要催办吗？" type="warning" @ok="onUrge(record)">
                      <a-tooltip content="催办" position="top" mini>
                        <a-button size="small">
                          <template #icon> <IconNotification :size="18" /> </template> </a-button
                      ></a-tooltip>
                    </a-popconfirm>
                    <a-tooltip content="转办" position="top" mini>
                      <a-button size="small" @click="onTransferOpen(record)">
                        <template #icon> <IconSwap :size="18" /> </template> </a-button
                    ></a-tooltip>
                  </template>
                </div>
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

    <!-- 流程转办弹窗 -->
    <a-modal :visible="showTransferModal" @ok="handleTransferOK" @cancel="onTransferClose" draggable>
      <template #title> 流程转办 </template>
      <div class="flow-transfer-box">
        <a-form :model="transferForm" :rules="transferFormRules" ref="transferFormRef" layout="vertical">
          <a-form-item field="assigneeId" label="原审批人" :required="true">
            <a-select v-model:model-value="transferForm.assigneeId" allow-search placeholder="请选择原审批人">
              <a-option v-for="user in flowAssignees" :value="user.id" :label="user.name" />
            </a-select>
          </a-form-item>
          <a-form-item field="newAssigneeId" label="转办给" :required="true">
            <a-select v-model:model-value="transferForm.newAssigneeId" allow-search placeholder="请选择转办人">
              <a-option v-for="user in flowOtherAssignees" :value="user.id" :label="user.name" />
            </a-select>
          </a-form-item>
          <a-form-item field="comment" label="转办原因">
            <a-textarea v-model:model-value="transferForm.comment" placeholder="请输入转办原因" allow-clear :max-length="500" show-word-limit />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import FlowDataApi from "@/api/FlowDataApi";
import FlowInstApi from "@/api/FlowInstApi";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { STATUS, STATUS_LIST } from "@/components/flow/common/FlowConstant";
import { useOrganStore } from "@/stores";
import { Message } from "@arco-design/web-vue";
import { IconExport, IconFilter, IconNotification, IconRefresh, IconSearch, IconSwap } from "@arco-design/web-vue/es/icon";
import { computed, onBeforeMount, onMounted, ref } from "vue";
import FlowDetail from "../my-flow/flow-detail.vue";

const organStore = useOrganStore();
const users = computed(() => organStore.users);
const groups = ref([]);
const flowBeginTime = ref([]);
const flowEndTime = ref([]);
const flowInsts = ref([]);
const tableLoading = ref(false);
const query = ref({ page: 1, size: 10, total: 0 });
const loading = ref(false);

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
  FlowDataApi.listFlowInsts(query.value)
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

// 导出
const onExport = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  window.open(`${baseUrl}/flowdata/export?${new URLSearchParams(query.value)}`);
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

// 流程转办
const showTransferModal = ref(false);
const flowAssignees = ref([]); // 当前审批人
const flowOtherAssignees = ref([]); // 其他审批人
const transferFormRef = ref(); // 表单组件ref
const transferForm = ref({}); // 表单
const transferFormRules = ref({
  assigneeId: { required: true, message: "请选择原审批人" },
  newAssigneeId: { required: true, message: "请选择转办人" },
});
const onTransferOpen = (flowInst) => {
  transferForm.value = { flowInstId: flowInst.id };
  showTransferModal.value = true;
  flowAssignees.value = [];
  flowOtherAssignees.value = [];
  FlowDataApi.listFlowInstAssignees({ flowInstId: flowInst.id }).then((resp) => {
    if (resp.code == 1) {
      flowAssignees.value = resp.data || [];
      const flowAssigneeIds = flowAssignees.value.map((item) => item.id);
      flowOtherAssignees.value = users.value.filter((item) => !flowAssigneeIds.includes(item.id));
    }
  });
};
const onTransferClose = () => {
  showTransferModal.value = false;
  transferFormRef.value.resetFields();
};
const handleTransferOK = () => {
  transferFormRef.value.validate((err) => {
    if (err) return;
    loading.value = true;
    FlowDataApi.transfer(transferForm.value)
      .then((resp) => {
        loading.value = false;
        if (resp.code == 1) {
          Message.success("已转办！");
          onTransferClose();
        }
      })
      .catch((_) => (loading.value = false));
  });
};

// 催办
const onUrge = (flowInst) => {
  loading.value = true;
  FlowInstApi.urge({ flowInstId: flowInst.id })
    .then((resp) => {
      loading.value = false;
      if (resp.code == 1) {
        Message.success("已催办！");
      }
    })
    .catch(() => (loading.value = false));
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

      .btn-box {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        svg {
          color: var(--color-text-2);
        }
      }
    }
  }
}
</style>
