<template>
  <div class="fd-main-box">
    <a-card class="general-card">
      <div class="operation-area">
        <div class="group-name">
          <a-input :style="{ minWidth: '240px' }" v-model:model-value="flowName" placeholder="搜索" allow-clear :max-length="16">
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
      <a-divider />
      <div class="empty-flow-box" v-if="!groups || groups.length == 0"><a-empty /></div>
      <div class="flow-groups">
        <template v-for="group in groups">
          <div class="group-item">
            <div class="group-header">
              <div class="name">
                <editable-text v-model:value="group.name" @change="onGroupNameChange($event, group)" />
              </div>
              <div class="operaion">
                <a-popconfirm
                  v-if="!group.flowDefinitions || group.flowDefinitions.length == 0"
                  type="warning"
                  content="确认删除该分组 ?"
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
                    <a-popconfirm
                      v-if="item.status == 0"
                      type="warning"
                      content="确认禁用该流程 ?"
                      @ok="onFlowFreeze(item, group)"
                      position="tr">
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
    </a-card>
    <flow-group-edit ref="groupModel" v-model:group="group" @ok="onGroupAdded($event)"></flow-group-edit>
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

const router = useRouter();
const flowStore = useFlowStore();
const userStore = useUserStore();
const { getById } = useOrganStore();

let flowName = ref(""); // 流程名称检索
let groups = ref([]);
const loadGroups = () => {
  FlowManApi.listGroupsWithFlowDefinition().then((resp) => {
    if (resp.code == 1) {
      groups.value = resp.data || [];
    }
  });
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
    workFlowDef: { name: "审批", icon: "approval", flowAdminIds: [user.id], cancelable: 1 },
    nodeConfig: { name: "发起人", type: 0 },
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

.fd-main-box {
  user-select: none;
  width: 100%;
  height: calc(100vh - @HeaderHeight - @BreadcrumbHeight);
  overflow: hidden auto;
  padding: 0 @ContentPadding;

  .operation-area {
    display: flex;
    justify-content: space-between;
    margin-bottom: 18px;

    button {
      + button {
        margin-left: 10px;
      }
    }
  }

  .empty-flow-box {
    border: 1px solid var(--color-border);
    border-radius: 2px 2px 0 0;
    padding: 48px;
  }

  .flow-groups {
    .group-item {
      border-radius: 4px;
      // box-shadow: 0 0 3px 1px #eee;
      background-color: #fff;
      overflow: hidden;
      border: 1px solid #f1f1f1;

      + .group-item {
        margin-top: 18px;
      }

      .group-header {
        height: 50px;
        color: #252834;
        background-color: #f9fafa;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px;
        // border-bottom: 1px solid #efefef;
      }

      .group-body {
        .flow-item {
          padding: 10px 18px;
          display: flex;
          align-items: center;
          border-top: 1px solid #f1f1f1;
          transition: all 0.2s;

          &:hover {
            background-color: #ededee;
          }

          .flow-item-field {
            + .flow-item-field {
              margin-left: 10px;
            }
          }

          .name-icon {
            flex: 1;
            display: flex;
            align-items: center;

            .name-desc {
              display: flex;
              flex-direction: column;
              max-width: 400px;
              margin-left: 10px;

              .desc {
                font-size: 13px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                line-height: 17px;
                color: #8f959e;
                font-weight: 400;
              }
            }

            .tag {
              margin-left: 10px;
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

            button + button {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
