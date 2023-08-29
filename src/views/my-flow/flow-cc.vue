<!-- 审批流程 -->
<template>
  <section class="flow-approve-box">
    <!-- 检索条件 -->
    <div class="flow-content">
      <div class="search-box">
        <div class="search-segment" style="flex: 1">
          <!-- <a-input v-model="query.name" :max-length="16" allow-clear long placeholder="流程名称" /> -->
          <a-input-search
            v-model="query.name"
            :max-length="16"
            allow-clear
            placeholder="流程名称"
            search-button
            :button-props="{ type: 'secondary' }"
            @press-enter="onSearch()"
            @search="onSearch()">
            <template #button-icon><icon-search /></template>
          </a-input-search>
        </div>
        <!-- <div class="search-segment">
          <a-tooltip content="搜索">
            <a-button @click="onSearch()"> <icon-search /> </a-button>
          </a-tooltip>
        </div> -->
        <div class="search-segment">
          <a-tooltip content="重置">
            <a-button @click="onSearchReset()"> <icon-refresh /> </a-button>
          </a-tooltip>
        </div>
        <div class="search-segment">
          <a-popover position="rt" trigger="click" :show-arrow="false" class="flow-search-more-popover" animation-name="slide-fade">
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

      <!-- 流程列表 -->
      <div class="flow-list-box">
        <div class="empty-box" v-if="flowInsts.length == 0">
          <a-empty></a-empty>
        </div>
        <div
          v-else
          :class="['item-box', selectedFlow.id == inst.id ? 'item-box-choosed' : '']"
          v-for="inst in flowInsts"
          @click="onFlowInstClicked(inst)">
          <div class="header">
            <a-typography-text bold class="name">{{ inst.name }}</a-typography-text>
            <div class="status">
              <a-tag color="blue" v-if="inst.status == STATUS_LIST[0].value">{{ STATUS_LIST[0].name }}</a-tag>
              <a-tag color="green" v-else-if="inst.status == STATUS_LIST[1].value">{{ STATUS_LIST[1].name }}</a-tag>
              <a-tag color="red" v-else-if="inst.status == STATUS_LIST[2].value">{{ STATUS_LIST[2].name }}</a-tag>
              <a-tag color="orangered" v-else-if="inst.status == STATUS_LIST[3].value">{{ STATUS_LIST[3].name }}</a-tag>
            </div>
          </div>
          <div class="summary">
            <div class="summary-item" v-for="(value, label) in inst.summary">
              <div class="label">{{ label }}</div>
              <div class="value">{{ value }}</div>
            </div>
          </div>
          <div class="footer">
            <div class="initiator">
              <!-- <a-avatar :size="20" class="avatar">{{ inst.initiatorId }}</a-avatar>
              {{ inst.initiatorId }} -->
              <flow-node-avatar :size="20" :id="inst.initiatorId"></flow-node-avatar>
            </div>
            <div class="begin-time">提交于 {{ inst.beginTime }}</div>
          </div>
        </div>
        <div class="spin-box" ref="spinbox">
          <a-spin v-if="haveMore"></a-spin>
        </div>
      </div>
    </div>

    <!-- 流程详情 -->
    <div class="flow-detail-content">
      <flow-detail :flow-inst="selectedFlow" :cancelable="false" :action="false" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onBeforeMount, onMounted, onBeforeUnmount } from "vue";
import { useOrganStore } from "@/stores";
import FlowManApi from "@/api/FlowManApi";
import FlowApi from "@/api/FlowApi";
import OrganApi from "@/api/OrganApi";
import FlowDetail from "./flow-detail.vue";
import { STATUS_LIST } from "@/components/flow/common/FlowConstant";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import { IconSearch, IconRefresh, IconFilter } from "@arco-design/web-vue/es/icon";

let organStore = useOrganStore();
let users = computed(() => organStore.users);
let groups = ref([]);

let query = ref({ page: 0, size: 10, total: 0 });
let flowInsts = ref([]);
let flowBeginTime = ref([]);
let flowEndTime = ref([]);
let selectedFlow = ref({});

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
  haveMore.value = true;
  register();
};

const onSearchReset = () => {
  query.value = { page: 0, size: 10, total: 0 };
  flowBeginTime.value = null;
  flowEndTime.value = null;
  flowInsts.value = [];
  haveMore.value = true;
  register();
};

const loadFlowInsts = () => {
  query.value.page++;
  FlowApi.listMineFlowInstCcs(query.value).then((resp) => {
    if (resp.code == 1) {
      let { data, total } = resp;
      flowInsts.value.push(...data);
      query.value.total = total;
      if (flowInsts.value.length >= total) {
        haveMore.value = false;
      }
    }
  });
};

const onFlowInstClicked = (inst) => {
  selectedFlow.value = inst;
};

const loadFlowGroups = () => {
  FlowManApi.listGroups().then((resp) => {
    if (resp.code == 1) {
      groups.value = resp.data || [];
    }
  });
};

// 无限加载
const ob = ref();
const spinbox = ref();
const haveMore = ref(true);

// 注册观察器
const register = () => {
  ob.value.unobserve(spinbox.value);
  ob.value.observe(spinbox.value);
};

onMounted(() => {
  const obCallback = (entries) => {
    let entry = entries[0];
    if (!entry.isIntersecting) return;
    if (haveMore.value) loadFlowInsts();
  };

  ob.value = new IntersectionObserver(obCallback, { threshold: 0 });
  ob.value.observe(spinbox.value);
});

onBeforeUnmount(() => {
  ob.value.unobserve(spinbox.value);
});

onBeforeMount(() => {
  OrganApi.loadOrgan();
  loadFlowGroups();
});
</script>

<style lang="less">
@import "./flow-base.less";
</style>
