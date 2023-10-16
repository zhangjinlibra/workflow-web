<!-- 流程表单 -->
<template>
  <div class="flow-form-container">
    <!-- 表单 -->
    <a-divider orientation="left">{{ props.flow.name }}表单</a-divider>
    <a-form :model="flowForm" layout="vertical" class="flow-form-box">
      <template v-for="widget in flowWidgets">
        <a-form-item
          v-if="![WIDGET.DETAIL, WIDGET.DESCRIBE].includes(widget.type)"
          class="field-item"
          :required="widget.required"
          :label="widget.label">
          <template v-if="widget.type == WIDGET.SINGLELINE_TEXT">
            <a-input
              v-model:model-value="flowForm[widget.name]"
              :max-length="64"
              :placeholder="widget.placeholder"
              :allow-clear="!widget.required" />
          </template>
          <template v-else-if="widget.type == WIDGET.MULTILINE_TEXT">
            <a-textarea
              v-model:model-value="flowForm[widget.name]"
              :max-length="128"
              :placeholder="widget.placeholder"
              :allow-clear="!widget.required" />
          </template>
          <template v-else-if="widget.type == WIDGET.NUMBER">
            <a-input-number
              v-model:model-value="flowForm[widget.name]"
              :hide-button="true"
              :max-length="15"
              :formatter="(v) => ObjectUtil.limitScale(v, 4)"
              :allow-clear="!widget.required"
              :placeholder="widget.placeholder" />
          </template>
          <template v-else-if="widget.type == WIDGET.MONEY">
            <a-input-number
              v-model:model-value="flowForm[widget.name]"
              :allow-clear="!widget.required"
              :min="0"
              :max-length="15"
              :hide-button="true"
              :formatter="(v) => ObjectUtil.limitScale(v, 2)"
              :placeholder="widget.placeholder">
              <template #append> CNY-人民币元 </template>
            </a-input-number>
          </template>
          <template v-else-if="widget.type == WIDGET.SINGLE_CHOICE">
            <a-select v-model:model-value="flowForm[widget.name]" :placeholder="widget.placeholder" :allow-clear="!widget.required">
              <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
            </a-select>
          </template>
          <template v-else-if="widget.type == WIDGET.MULTI_CHOICE">
            <a-select v-model:model-value="flowForm[widget.name]" multiple :placeholder="widget.placeholder" :allow-clear="!widget.required">
              <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
            </a-select>
          </template>
          <template v-else-if="widget.type == WIDGET.DATE">
            <a-date-picker
              v-model:model-value="flowForm[widget.name]"
              :allow-clear="!widget.required"
              :value-format="widget.format"
              :format="widget.format"
              :show-time="widget.format.includes('H')"
              :style="{ width: '100%' }"
              :placeholder="widget.placeholder" />
          </template>
          <template v-else-if="widget.type == WIDGET.DATE_RANGE">
            <a-range-picker
              v-model:model-value="flowForm[widget.name]"
              :allow-clear="!widget.required"
              :value-format="widget.format"
              :format="widget.format"
              :show-time="widget.format.includes('H')"
              :style="{ width: '100%' }" />
          </template>
          <template v-else-if="widget.type == WIDGET.PICTURE">
            <a-upload
              v-model:file-list="flowForm[widget.name]"
              list-type="picture-card"
              :image-preview="true"
              :action="fileUploadUrl"
              :headers="fileUploadHeaders"
              :limit="10"
              :multiple="true" />
          </template>
          <template v-else-if="widget.type == WIDGET.ATTACHMENT">
            <a-upload
              v-model:file-list="flowForm[widget.name]"
              :action="fileUploadUrl"
              :headers="fileUploadHeaders"
              :limit="10"
              :multiple="true">
              <template #upload-button>
                <a-button>
                  <template #icon><icon-plus /></template>上传文件
                </a-button>
              </template>
            </a-upload>
          </template>
          <template v-else-if="widget.type == WIDGET.DEPARTMENT">
            <a-select v-model:model-value="flowForm[widget.name]" :placeholder="widget.placeholder" allow-search :allow-clear="!widget.required">
              <a-option v-for="dept in allDepts || []" :value="dept.id">{{ dept.name }}</a-option>
            </a-select>
          </template>
          <template v-else-if="widget.type == WIDGET.EMPLOYEE">
            <a-select v-model:model-value="flowForm[widget.name]" :placeholder="widget.placeholder" allow-search :allow-clear="!widget.required">
              <a-option v-for="user in allUsers || []" :value="user.id">{{ user.name }}</a-option>
            </a-select>
          </template>
          <template v-else-if="widget.type == WIDGET.AREA">
            <a-cascader
              v-model:model-value="flowForm[widget.name]"
              :options="CHINA_AREA"
              allow-search
              path-mode
              expand-trigger="hover"
              :placeholder="widget.placeholder"
              :allow-clear="!widget.required" />
          </template>
          <template v-else-if="widget.type == WIDGET.FLOW_INST">
            <div class="flow-inst-widget">
              <div class="flow-inst-widget-btn">
                <a-link class="" @click="onFlowSelectClicked()">
                  <template #icon><icon-plus /></template>添加审批
                </a-link>
              </div>
              <div class="flow-inst-list">
                <FlowCard v-for="id in flowForm[widget.name]" :flow-inst-id="id"></FlowCard>
              </div>
              <FlowSelect v-model:visible="showFlowSelect" v-model:selected="flowForm[widget.name]"></FlowSelect>
            </div>
          </template>
        </a-form-item>
        <template v-else-if="widget.type == WIDGET.DESCRIBE">
          <div class="describe"><icon-info-circle />{{ widget.placeholder }}</div>
        </template>
        <template v-else-if="widget.type == WIDGET.DETAIL">
          <flow-widget-detail :widget="widget" :headers="fileUploadHeaders" :url="fileUploadUrl" :form="flowForm" />
        </template>
      </template>
    </a-form>
    <!-- 预览 -->
    <a-divider orientation="left">审批流程</a-divider>
    <section v-if="flowNodes && flowNodes.length > 0" class="flow-preview-box">
      <!-- <div class="flow-preview-title">审批流程</div> -->
      <div class="flow-preview-nodes">
        <a-timeline mode="left">
          <template v-for="node in flowNodes">
            <a-timeline-item label="" :dotColor="flowTimeLineDotColors[node.nodeType].color">
              <!-- 开始节点 -->
              <div class="node-box" v-if="node.nodeType == NODE.START">
                <div class="node-name">开始</div>
              </div>
              <!-- 审批人节点 -->
              <div class="node-box" v-else-if="node.nodeType == NODE.APPROVE">
                <div class="node-name">
                  审批
                  <div class="node-type" v-if="node.approvalType == 1">自动通过</div>
                  <div class="node-type" v-if="node.approvalType == 2">自动拒绝</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 1">需所有人审批同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 2">只需一人审批同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 3">需依次审批同意</div>
                </div>
                <div class="node-content">
                  <div v-if="node.initatorChoice" class="initator-chioce">
                    <a-button size="small" @click="onChooseUserClicked()">
                      <template #icon><icon-plus /></template>
                    </a-button>
                    <span class="assignee-list">
                      <flow-node-avatar v-for="userId in flowNodeDesignees[node.id]" :size="20" :id="userId" class="assignee-item" />
                    </span>
                    <OrganChooseBox
                      v-if="showChooseUser"
                      v-model:visible="showChooseUser"
                      v-model:selected="flowNodeDesignees[node.id]"
                      :hidden-dept="true"
                      :hidden-role="true" />
                  </div>
                  <template v-else>
                    <div class="node-null-assignee" v-if="node.approvalType == 0 && node.userIds.length == 0 && node.roleIds.length == 0">
                      <template v-if="node.flowNodeNoAuditorType == 0">
                        <div class="null-tooltip">没有审批人，自动通过</div>
                      </template>
                      <template v-else-if="node.flowNodeNoAuditorType == 1">
                        <div class="null-tooltip">没有审批人，指定人员审批</div>
                        <flow-node-avatar :size="20" :id="node.flowNodeNoAuditorAssignee" class="assignee-item" />
                      </template>
                      <template v-else-if="node.flowNodeNoAuditorType == 2">
                        <div class="null-tooltip">没有审批人，转交给流程管理员</div>
                        <flow-node-avatar :size="20" :id="node.flowNodeAuditAdmin" class="assignee-item" />
                      </template>
                    </div>
                    <div v-else class="node-assignee">
                      <flow-node-avatar v-for="userId in node.userIds" :size="20" :id="userId" class="assignee-item" />
                      <flow-node-role-avatar v-for="roleId in node.roleIds" :size="20" :id="roleId" class="assignee-item" />
                    </div>
                  </template>
                </div>
              </div>
              <!-- 办理人节点 -->
              <div class="node-box" v-else-if="node.nodeType == NODE.TRANSACT">
                <div class="node-name">
                  办理
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 1">需所有人办理同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 2">只需一人办理同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 3">需依次办理同意</div>
                </div>
                <div class="node-content">
                  <div v-if="node.initatorChoice" class="initator-chioce">
                    <a-button size="small" @click="onChooseUserClicked()">
                      <template #icon><icon-plus /></template>
                    </a-button>
                    <span class="assignee-list">
                      <flow-node-avatar v-for="userId in flowNodeDesignees[node.id]" :size="20" :id="userId" class="assignee-item" />
                    </span>
                    <OrganChooseBox
                      v-if="showChooseUser"
                      v-model:visible="showChooseUser"
                      v-model:selected="flowNodeDesignees[node.id]"
                      :hidden-dept="true"
                      :hidden-role="true" />
                  </div>
                  <template v-else>
                    <div class="node-null-assignee" v-if="node.approvalType == 0 && node.userIds.length == 0 && node.roleIds.length == 0">
                      <template v-if="node.flowNodeNoAuditorType == 1">
                        <div class="null-tooltip">没有办理人，指定人员办理</div>
                        <flow-node-avatar :size="20" :id="node.flowNodeNoAuditorAssignee" class="assignee-item" />
                      </template>
                      <template v-else-if="node.flowNodeNoAuditorType == 2">
                        <div class="null-tooltip">没有办理人，转交给审批管理员</div>
                        <flow-node-avatar :size="20" :id="node.flowNodeAuditAdmin" class="assignee-item" />
                      </template>
                    </div>
                    <div v-else class="node-assignee">
                      <flow-node-avatar v-for="userId in node.userIds" :size="20" :id="userId" class="assignee-item" />
                      <flow-node-role-avatar v-for="roleId in node.roleIds" :size="20" :id="roleId" class="assignee-item" />
                    </div>
                  </template>
                </div>
              </div>
              <!-- 抄送人节点 -->
              <div class="node-box" v-else-if="node.nodeType == NODE.COPY">
                <div class="node-name">抄送</div>
                <div class="node-content">
                  <div class="node-cc">
                    <template v-if="node.userIds.length > 0">
                      <flow-node-avatar v-for="userId in node.userIds" :size="20" :id="userId" class="assignee-item" />
                    </template>
                    <template v-else> <div class="null-tooltip">没有抄送人</div> </template>
                  </div>
                </div>
              </div>
              <!-- 结束节点 -->
              <div class="node-box" v-else-if="node.nodeType == NODE.END">
                <div class="node-name">结束</div>
              </div>
            </a-timeline-item>
          </template>
        </a-timeline>
      </div>
    </section>
    <a-alert v-else type="warning">必填信息填写完整后，将显示审批流程，之后方可提交审批。</a-alert>
    <!-- 按钮 -->
    <a-divider orientation="left"></a-divider>
    <section class="flow-btn-box">
      <a-button @click="handleCancel()">取消</a-button>
      <a-button type="primary" @click="handleOk()" :disabled="!formValidated || launching">提交</a-button>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from "vue";
import { useOrganStore } from "@/stores";
import { getToken } from "@/utils/auth";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import FlowApi from "@/api/FlowApi";
import FlowManApi from "@/api/FlowManApi";
import { FILE_BASE_URL } from "@/api/FileApi";
import { NODE, WIDGET } from "@/components/flow/common/FlowConstant";
import { Message } from "@arco-design/web-vue";
import { IconPlus, IconInfoCircle } from "@arco-design/web-vue/es/icon";
import FlowWidgetDetail from "./flow-launch-widget-detail.vue";
import OrganChooseBox from "@/components/flow/dialog/OrganChooseBox.vue";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import FlowNodeRoleAvatar from "@/components/common/FlowNodeRoleAvatar.vue";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import FlowSelect from "./flow-inst-select.vue";
import FlowCard from "./flow-card.vue";

let props = defineProps({
  flow: { type: Object, default: () => {} },
  flowWidgets: { type: Object, default: () => {} },
});

let emits = defineEmits(["onSuccess", "onCancel"]);

let { users: allUsers, depts: allDepts } = useOrganStore();

let fileUploadUrl = FILE_BASE_URL + "/upload"; //文件上传地址
let fileUploadHeaders = ref({ Authorization: getToken() }); // 文件上传请求头
let flowWidgetMap = null; // 表单组件Map，会在第一次提交表单时生成。
let flowForm = ref({}); // 流程的表单
let flowNodes = ref([]); // 预览的流程节点
let flowNodeDesignees = ref({}); // 流程节点指定的执行人
let formValidated = ref(false); // 表单是否校验通过
let flowPreviewed = ref(false); // 流程是否已经预览
let formErrors = ref([]); // 流程表单校验错误
let launching = ref(false); // 流程发起中
let showFlowSelect = ref(false); // 是否显示流程选择框

let flowTimeLineDotColors = reactive({}); // 时间线点的颜色
flowTimeLineDotColors[NODE.START] = { color: "#a9b4cd" };
flowTimeLineDotColors[NODE.APPROVE] = { color: "#ff943e" };
flowTimeLineDotColors[NODE.COPY] = { color: "#3296fa" };
flowTimeLineDotColors[NODE.TRANSACT] = { color: "#926bd5" };
flowTimeLineDotColors[NODE.END] = { color: "#a9b4cd" };

watch(
  () => flowForm,
  () => flowPreview(),
  { deep: true }
);

watch(
  () => props.flowWidgets,
  () => flowPreview(),
  { deep: true }
);

watch(
  () => props.flow,
  () => {
    // 重置表单相关项目
    flowWidgetMap = null;
    flowForm.value = {};
    flowNodeDesignees.value = {};
    flowNodes.value = [];
    formValidated.value = false;
    flowPreviewed.value = false;
    formErrors.value = [];
  }
);

let showChooseUser = ref(false);
const onChooseUserClicked = () => (showChooseUser.value = true);

// 校验表单必填项
const validFlowForm = () => {
  let validated = true;
  formErrors.value = [];
  console.log("校验的组件：", props.flowWidgets);
  if (props.flowWidgets.length == 0) return;
  (props.flowWidgets || []).forEach((flowWidget) => {
    let { name, required, label, type } = flowWidget;
    let formItemValue = flowForm.value[name];
    if (required) {
      // 其他组件
      if (!(formItemValue && formItemValue != "")) {
        formErrors.value.push(`表单必填项 "${label}" 未填写`);
        validated = false;
      }
    } else if ([9].includes(type)) {
      // 明细组件
      let detailWidgets = flowWidget.details || [];
      detailWidgets = detailWidgets.filter((detailWidget) => detailWidget.required);
      if (detailWidgets.length > 0) {
        if (!(formItemValue && formItemValue.length > 0)) {
          formErrors.value.push(`表单必填项 "${label}" 未填写`);
          validated = false;
        } else {
          detailWidgets.forEach((detailWidget) => {
            let { name: name0, label: label0 } = detailWidget;
            formItemValue.forEach((detailValues) => {
              let detailItemValue = detailValues[name0];
              if (!(detailItemValue && detailItemValue != "")) {
                formErrors.value.push(`表单必填项 "${label0}" 未填写`);
                validated = false;
              }
            });
          });
        }
      }
    }
  });
  formValidated.value = validated;
};
// 流程预览
const flowPreview = () => {
  validFlowForm(); // 校验表单
  if (formValidated.value) {
    flowPreviewed.value = false;
    FlowApi.viewProcessChart({
      flowDefId: props.flow.id,
      flowValue: JSON.stringify(flowForm.value),
    }).then((resp) => {
      if (resp.code == 1) {
        flowNodes.value = resp.data || [];
        flowPreviewed.value = true;
      }
    });
  }
};
// 处理表单值
const handleFormValue = (flowWidgets, flowValue) => {
  // 组件map是否已经初始化
  let flowWidgetTmpMap = flowWidgetMap;
  if (!!!flowWidgetTmpMap) {
    flowWidgetTmpMap = FlowManApi.formWidgetListToMap(flowWidgets);
    flowWidgetMap = flowWidgetTmpMap;
  }
  // 处理表单值
  for (let name in flowValue) {
    let widget = flowWidgetTmpMap[name];
    if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(widget.type)) {
      // 取出上传的文件id
      flowValue[name] = (flowValue[name] || []).map((v) => (v.response || {}).data.id);
    } else if (widget.type == WIDGET.DETAIL) {
      flowValue[name].forEach((flowDetailValue) => {
        for (let detailName in flowDetailValue) {
          let detailWidget = flowWidgetTmpMap[detailName];
          if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(detailWidget.type)) {
            flowDetailValue[detailName] = (flowDetailValue[detailName] || []).map((v) => (v.response || {}).data.id);
          }
        }
      });
    }
  }
  return flowValue;
};
// 发起审批
const handleOk = () => {
  launching.value = true;

  // 表单没有检查，先检查一下
  if (!formValidated.value && formErrors.value.length == 0) {
    validFlowForm();
  }

  // 节点指定的审批人
  let formDesignees = ObjectUtil.copy(flowNodeDesignees.value);
  // for (let flowNodeId in formDesignees) {
  //   let designees = formDesignees[flowNodeId];
  //   designees = designees.map((designee) => designee.id);
  //   formDesignees[flowNodeId] = designees;
  // }

  // 校验通过发起申请
  if (formValidated.value) {
    FlowApi.flowStart({
      flowDefId: props.flow.id,
      flowValue: JSON.stringify(handleFormValue(props.flowWidgets, ObjectUtil.copy(flowForm.value))),
      designees: formDesignees,
    }).then(
      (resp) => {
        launching.value = false;
        if (resp.code == 1) {
          Message.success(`成功发起申请${props.flow.name}`);
          emits("onSuccess");
        }
      },
      () => (launching.value = false)
    );
  } else {
    launching.value = false;
    Message.error({ title: "表单校验", content: "表单必填项需填写完整" });
  }
};
//  取消
const handleCancel = () => {
  emits("onCancel");
};

const onFlowSelectClicked = () => {
  showFlowSelect.value = true;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.flow-form-container {
  padding: 0 10px;

  .flow-form-box {
    .field-item {
      margin-bottom: 10px;
    }

    .flow-inst-widget {
      width: 100%;

      .flow-inst-widget-btn {
        height: 32px;
        display: flex;
        align-items: center;
      }

      .flow-inst-list {
        display: grid;
        gap: 6px;
        .flow-card-box {
          transition: box-shadow 0.2s cubic-bezier(0, 0, 1, 1);
          &:hover {
            box-shadow: 4px 4px 12px rgb(var(--gray-3));
          }
        }
      }
    }

    .describe {
      color: var(--color-text-2);
      font-size: 13px;
      background-color: var(--color-fill-2);
      border-radius: var(--border-radius-small);
      padding: 4px 12px;
      cursor: default;
      margin-bottom: 10px;

      svg {
        margin-right: 5px;
      }
    }
  }

  .flow-preview-box {
    user-select: none;
    margin-top: 16px;

    .flow-preview-nodes {
      margin-top: 8px;

      .node-box {
        .node-name {
          display: flex;
          flex-direction: row;
          align-items: baseline;

          .node-type {
            font-size: 12px;
            color: #8f959e;
            margin-left: 4px;
          }
        }

        .node-content {
          margin-bottom: 30px;

          .node-assignee,
          .node-cc {
            margin-top: 4px;
            display: grid;
            gap: 4px;
            grid-template-columns: repeat(auto-fill, minmax(70px, max-content));
          }

          .node-null-assignee {
            .assignee-item {
              margin-top: 4px;
              max-width: 70px;
            }
          }

          .null-tooltip {
            font-weight: 400;
            color: #86909c;
            font-size: 12px;
          }

          .initator-chioce {
            margin-top: 4px;
            display: flex;

            .assignee-list {
              flex: 1;
              margin-left: 10px;
              display: grid;
              gap: 4px;
              grid-template-columns: repeat(auto-fill, minmax(70px, max-content));
            }
          }
        }
      }
    }
  }

  .flow-btn-box {
    display: flex;
    align-items: center;
    justify-content: end;

    button + button {
      margin-left: 10px;
    }
  }
}
</style>

<style lang="less">
.flow-form-container {
  .arco-form-item-label-col {
    margin-bottom: 0;

    .arco-form-item-label {
      font-size: 13px;
      color: #999;
    }
  }

  .arco-upload-list-item-operation,
  .arco-upload-list-picture-operation {
    font-size: 16px;

    .arco-icon {
      font-size: 16px;
    }
  }
}

.flow-preview-box {
  .arco-timeline-item {
    &:last-child {
      min-height: 40px;
    }
  }
}
</style>
