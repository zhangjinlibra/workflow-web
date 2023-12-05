<template>
  <div class="fd-main-box" v-loading.fullscreen="loading">
    <!-- 检索区域 -->
    <div class="search-area">
      <div class="search-item">
        <a-input :style="{ minWidth: '240px' }" v-model:model-value="flowName" placeholder="请输入审批名称搜索" allow-clear :max-length="16">
          <template #prefix> <icon-search /> </template>
        </a-input>
      </div>
      <div class="btns">
        <a-button @click="onNewFlowBtnClick()">新建分组</a-button>
        <a-button type="primary" @click="onFlowCreate()">
          创建审批
          <template #icon> <icon-plus /> </template>
        </a-button>
      </div>
    </div>

    <!-- 流程列表区域 -->
    <div class="flow-groups-area">
      <a-card class="empty-flow-box general-card" v-if="!groups || groups.length == 0"> <a-empty /> </a-card>
      <template v-else v-for="group in groups">
        <div class="group-item-box">
          <div class="group-header">
            <div class="name">
              <editable-text v-model:value="group.name" @change="onGroupNameChange($event, group)" :hoverable="true" />
            </div>
            <div class="operaion">
              <a-popconfirm
                v-if="!group.flowDefinitions || group.flowDefinitions.length == 0"
                type="warning"
                content="确认删除该分组 ?"
                position="tr"
                @ok="onDeleteGroupClick(group)">
                <a-button size="small">
                  <template #icon><icon-delete :size="18" /> </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
          <div class="group-body">
            <div class="flow-item" v-for="item in filteredFlows(group.flowDefinitions)">
              <div class="name-icon flow-item-field">
                <flow-icon :icon="item.icon" :size="40"></flow-icon>
                <div class="name-desc">
                  <span>{{ item.name }}</span>
                  <span class="desc">{{ item.remark }}</span>
                </div>
                <div class="tag"><a-tag color="red" v-if="item.status == 1">已停用</a-tag></div>
              </div>
              <div class="version flow-item-field">
                <a-tag color="arcoblue">{{ `v${item.version}` }}</a-tag>
              </div>
              <div class="seeable flow-item-field">
                <template v-if="item.initiatorType == 0">全员可见</template>
                <template v-if="item.initiatorType == 1">
                  <a-tooltip :content="formatFlowInitiator(item.flowInitiators)">
                    <span>{{ formatFlowInitiator(item.flowInitiators) }}</span>
                  </a-tooltip>
                </template>
                <template v-if="item.initiatorType == 2">均不可见</template>
              </div>
              <div class="operations flow-item-field">
                <template v-if="item.editable">
                  <a-button size="small" @click="onFlowEdit(item)">
                    <template #icon> <icon-edit :size="18" /> </template>
                  </a-button>
                  <a-popconfirm v-if="item.status == 0" type="warning" content="确认禁用该流程 ?" @ok="onFlowFreeze(item, group)" position="tr">
                    <a-button size="small">
                      <template #icon> <icon-stop :size="18" /> </template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm v-else type="warning" content="确认启用该流程 ?" @ok="onFlowEnabled(item, group)" position="tr">
                    <a-button size="small">
                      <template #icon> <icon-check-circle :size="18" /> </template>
                    </a-button>
                  </a-popconfirm>
                  <a-popconfirm type="warning" content="确认删除该流程 ?" @ok="onFlowDelete(item, group)" position="tr">
                    <a-button size="small">
                      <template #icon> <icon-delete :size="18" /> </template>
                    </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <flow-group-edit ref="groupModel" v-model:group="group" @ok="onGroupAdded($event)"></flow-group-edit>
    <back-to-top target-container=".flow-groups-area"></back-to-top>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useFlowStore, useUserStore, useOrganStore } from "@/stores";
import { useRouter } from "vue-router";
import { Notification } from "@arco-design/web-vue";
import FlowManApi from "@/api/FlowManApi";
import OrganApi from "@/api/OrganApi";
import EditableText from "@/components/common/EditableText.vue";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import FlowIcon from "@/components/icons/FlowIcon.vue";
import FlowGroupEdit from "./flow-gorup-edit.vue";
import { IconSearch, IconPlus, IconDelete, IconEdit, IconStop, IconCheckCircle } from "@arco-design/web-vue/es/icon";
import BackToTop from "@/components/common/BackToTop.vue";

const router = useRouter();
const flowStore = useFlowStore();
const userStore = useUserStore();
const { getById } = useOrganStore();
const loading = ref(false);

let flowName = ref(""); // 流程名称检索
let groups = ref([]);
const loadGroups = () => {
  loading.value = true;
  FlowManApi.listGroupsWithFlowDefinition()
    .then((resp) => {
      if (resp.code == 1) {
        groups.value = resp.data || [];
      }
      loading.value = false;
    })
    .catch(() => (loading.value = false));
};
const filteredFlows = (flows) => {
  return (flows || []).filter((item) => item.name.includes(flowName.value));
};

// 流程发起者格式化
const formatFlowInitiator = (flowInitiators) => {
  return (flowInitiators || [])
    .map((item) => {
      item.id = item.organId;
      return getById(item.id).name;
    })
    .join("，");
};

// 分组相关
let group = ref({});
let groupModel = ref();
const onNewFlowBtnClick = () => {
  groupModel.value.show();
};
const onGroupAdded = (group) => {
  groups.value.push(group);
};
const onGroupNameChange = (name, group) => {
  if (!name || name == "") return;
  let oldName = group.name;
  group.name = name;
  FlowManApi.saveOrUpdateGroup({ id: group.id, name: name }).then((resp) => {
    if (resp.code == 0) group.name = oldName;
  });
};
const onDeleteGroupClick = (group) => {
  FlowManApi.deleteGroup({ id: group.id }).then((resp) => {
    if (resp.code == 1) {
      ArrayUtil.remove(groups.value, "id", group.id);
    }
  });
};

// 流程相关
const loadFlowConfig = (flowDefinition, callback) => {
  FlowManApi.getFlowConfig({ flowDefId: flowDefinition.id }).then((flowDef) => {
    callback && callback(flowDef);
  });
};
const onFlowCreate = () => {
  let user = userStore.loginUser;
  let flowDef = {
    workFlowDef: { name: null, icon: "approval", flowAdminIds: [user.id], cancelable: 1 },
    nodeConfig: { name: "发起", type: 0 },
    flowPermission: { type: 0 },
  };
  flowStore.setFlowDef(flowDef);
  flowStore.setFlowGroups(groups.value);
  router.push("/flowmanedit");
};
const onFlowEdit = (flowDefinition) => {
  loadFlowConfig(flowDefinition, (flowDef) => {
    flowStore.setFlowDef(flowDef);
    flowStore.setFlowGroups(groups.value);
    router.push("/flowmanedit");
  });
};
const onFlowDelete = (flowDefinition, group) => {
  FlowManApi.removeById({ flowDefId: flowDefinition.id }).then((resp) => {
    if (resp.code == 1) {
      ArrayUtil.remove(group.flowDefinitions, "id", flowDefinition.id);
      Notification.success("流程删除成功");
    }
  });
};
const onFlowFreeze = (flowDefinition, group) => {
  FlowManApi.freezeById({ flowDefId: flowDefinition.id }).then((resp) => {
    if (resp.code == 1) {
      flowDefinition.status = 1;
    }
  });
};
const onFlowEnabled = (flowDefinition, group) => {
  FlowManApi.enableById({ flowDefId: flowDefinition.id }).then((resp) => {
    if (resp.code == 1) {
      flowDefinition.status = 0;
    }
  });
};

onMounted(() => {});

onBeforeMount(() => {
  OrganApi.loadOrgan(); // 加载组织
  loadGroups();
});
</script>

<style scoped lang="less">
@import "@/styles/variables.module.less";

@SearchHeight: 55px;

.fd-main-box {
  user-select: none;
  width: 100%;
  height: calc(100vh - @AppHeaderHeight - @AppBreadcrumbHeight);
  // overflow: hidden auto;
  // overflow: hidden;
  // padding: 0 @Gap;

  .search-area {
    display: flex;
    justify-content: space-between;
    margin: 0 @LayoutGap @LayoutGap;
    border-radius: @BorderRadius;
    height: @SearchHeight;
    padding: 0 @Gap;
    background: #fff;
    display: flex;
    align-items: center;

    button {
      + button {
        margin-left: 10px;
      }
    }
  }

  .flow-groups-area {
    height: calc(100vh - @AppHeaderHeight - @AppBreadcrumbHeight - @SearchHeight - @LayoutGap);
    overflow: hidden auto;
    padding: 0 @LayoutGap;

    .empty-flow-box {
      border-radius: @BorderRadius;
      padding: 48px;
      background-color: #fff;
      border: 0;
    }

    .group-item-box {
      border-radius: @BorderRadius;
      // box-shadow: 0 0 3px 1px #eee;
      background-color: #fff;
      overflow: hidden;
      margin-bottom: @LayoutGap;

      .group-header {
        height: 48px;
        color: var(--color-text-2);
        background-color: #fafafa;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 @Gap;
        // border-bottom: 1px solid #efefef;
      }

      .group-body {
        .flow-item {
          padding: 10px @Gap;
          display: flex;
          align-items: center;
          border-top: 1px solid var(--color-neutral-2);
          transition: all 0.2s;
          gap: 10px;

          //   &:hover {
          //     background-color: #ededee;
          //   }

          .name-icon {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 10px;

            .name-desc {
              display: flex;
              flex-direction: column;
              justify-content: center;
              gap: 4px;
              max-width: 400px;

              .desc {
                font-size: 13px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                color: #8f959e;
                font-weight: 400;
              }
            }
          }

          .version {
            width: 60px;
          }

          .seeable {
            width: 30%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .operations {
            width: 120px;
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 10px;
          }
        }
      }
    }
  }
}
</style>
