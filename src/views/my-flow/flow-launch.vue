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
          <template v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MAILBOX, WIDGET.MOBILE, WIDGET.IDCARD, WIDGET.WEBSITE].includes(widget.type)">
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
          <template v-else-if="widget.type == WIDGET.RICH_TEXT">
            <RichText v-model:value="flowForm[widget.name]" :placeholder="widget.placeholder" />
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
              :style="{ width: '100%' }"
              :placeholder="[widget.placeholder, widget.placeholder]" />
          </template>
          <template v-else-if="widget.type == WIDGET.PICTURE">
            <a-upload
              v-model:file-list="flowForm[widget.name]"
              list-type="picture-card"
              :image-preview="true"
              :action="FILE_UPLOAD_URL"
              :headers="fileUploadHeaders"
              :with-credentials="true"
              :limit="10"
              :multiple="true"
              @change="handleFileListChange" />
          </template>
          <template v-else-if="widget.type == WIDGET.ATTACHMENT">
            <a-upload
              v-model:file-list="flowForm[widget.name]"
              :action="FILE_UPLOAD_URL"
              :headers="fileUploadHeaders"
              :with-credentials="true"
              :limit="10"
              :multiple="true"
              @change="handleFileListChange">
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
                <a-link @click="onFlowSelectClicked(widget)">
                  <template #icon><icon-plus /></template>添加审批
                </a-link>
              </div>
              <div class="flow-inst-list">
                <FlowCard v-for="id in flowForm[widget.name]" :flow-inst-id="id"></FlowCard>
              </div>
              <FlowInstSelect
                v-if="flowInstSelectVisible"
                v-model:visible="flowInstSelectVisible"
                v-model:selected="flowForm[selectedFlowInstWidget.name]"></FlowInstSelect>
            </div>
          </template>
          <template v-else-if="widget.type == WIDGET.RATE">
            <a-rate v-model:model-value="flowForm[widget.name]" allow-half allow-clear />
          </template>
          <template v-else-if="widget.type == WIDGET.FORMULA">
            <a-input v-model:model-value="flowForm[widget.name]" :placeholder="`=${widget.placeholder || ''}`" disabled />
          </template>
        </a-form-item>
        <template v-else-if="widget.type == WIDGET.DESCRIBE">
          <div class="describe"><icon-info-circle />{{ widget.placeholder }}</div>
        </template>
        <template v-else-if="widget.type == WIDGET.DETAIL">
          <FlowLaunchWidgetDetail :widget="widget" :headers="fileUploadHeaders" :url="FILE_UPLOAD_URL" :form="flowForm" />
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
                <div class="node-name">{{ node.name }}</div>
              </div>
              <!-- 审批人节点 -->
              <div class="node-box" v-else-if="node.nodeType == NODE.APPROVE">
                <div class="node-name">
                  {{ node.name }}
                  <div class="node-type" v-if="node.approvalType == 1">自动通过</div>
                  <div class="node-type" v-if="node.approvalType == 2">自动拒绝</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 1">需所有人审批同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 2">只需一人审批同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 3">需依次审批同意</div>
                </div>
                <div class="node-content">
                  <div v-if="node.initatorChoice" class="initator-chioce">
                    <a-button size="small" @click="onChooseUserClicked(node.id)">
                      <template #icon><icon-plus /></template>
                    </a-button>
                    <span class="assignee-list">
                      <flow-node-avatar v-for="userId in flowNodeDesignees[node.id]" :size="20" :id="userId" class="assignee-item" />
                    </span>
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
                  {{ node.name }}
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 1">需所有人办理同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 2">只需一人办理同意</div>
                  <div class="node-type" v-if="node.multiInstanceApprovalType == 3">需依次办理同意</div>
                </div>
                <div class="node-content">
                  <div v-if="node.initatorChoice" class="initator-chioce">
                    <a-button size="small" @click="onChooseUserClicked(node.id)">
                      <template #icon><icon-plus /></template>
                    </a-button>
                    <span class="assignee-list">
                      <flow-node-avatar v-for="userId in flowNodeDesignees[node.id]" :size="20" :id="userId" class="assignee-item" />
                    </span>
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
                <div class="node-name">{{ node.name }}</div>
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
                <div class="node-name">{{ node.name }}</div>
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

    <!-- 指定审批人选项 -->
    <OrganChooseBox
      v-if="showChooseUser"
      v-model:visible="showChooseUser"
      v-model:selected="flowNodeDesignees[choosedUserNodeId]"
      @ok="handleOrganChooseOk"
      :hidden-dept="true"
      :hidden-role="true" />
  </div>
</template>

<script setup>
import FileApi, { FILE_DOWNLOAD_URL, FILE_UPLOAD_URL } from "@/api/FileApi";
import FlowInstApi from "@/api/FlowInstApi";
import FlowManApi from "@/api/FlowManApi";
import FlowNodeAvatar from "@/components/common/FlowNodeAvatar.vue";
import FlowNodeRoleAvatar from "@/components/common/FlowNodeRoleAvatar.vue";
import RichText from "@/components/common/RichText.vue";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import { NODE, NODE_COLOR, WIDGET } from "@/components/flow/common/FlowConstant";
import { formFormulaAutoCalc } from "@/components/flow/common/FlowFormula";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import OrganChooseBox from "@/components/flow/dialog/OrganChooseBox.vue";
import { useOrganStore } from "@/stores";
import { getToken } from "@/utils/auth";
import { Message } from "@arco-design/web-vue";
import { IconInfoCircle, IconPlus } from "@arco-design/web-vue/es/icon";
import { onBeforeMount, reactive, ref, watch } from "vue";
import FlowCard from "./flow-card.vue";
import FlowInstSelect from "./flow-inst-select.vue";
import FlowLaunchWidgetDetail from "./flow-launch-widget-detail.vue";

let props = defineProps({
  flow: { type: Object, default: () => {} },
  flowWidgets: { type: Object, default: () => {} },
  relaunchFlowForm: { type: Object }, // 再次申请的流程表单
});

let emits = defineEmits(["onSuccess", "onCancel"]);

let { users: allUsers, depts: allDepts } = useOrganStore();

let fileUploadHeaders = ref({ Authorization: getToken() }); // 文件上传请求头
let flowWidgetMap = null; // 表单组件Map，会在第一次提交表单时生成。
let flowForm = ref({}); // 流程的表单
let flowNodes = ref([]); // 预览的流程节点
let flowNodeDesignees = ref({}); // 流程节点指定的执行人
let formValidated = ref(false); // 表单是否校验通过
let flowPreviewed = ref(false); // 流程是否已经预览
let formErrors = ref([]); // 流程表单校验错误
let launching = ref(false); // 流程发起中
let flowInstSelectVisible = ref(false); // 是否显示流程选择框

let flowTimeLineDotColors = reactive({}); // 时间线点的颜色
flowTimeLineDotColors[NODE.START] = { color: NODE_COLOR.START };
flowTimeLineDotColors[NODE.APPROVE] = { color: NODE_COLOR.APPROVE };
flowTimeLineDotColors[NODE.COPY] = { color: NODE_COLOR.COPY };
flowTimeLineDotColors[NODE.TRANSACT] = { color: NODE_COLOR.TRANSACT };
flowTimeLineDotColors[NODE.END] = { color: NODE_COLOR.END };

watch(
  () => flowForm,
  () => flowPreview(),
  { deep: true }
);

watch(
  () => props.flowWidgets,
  () => {
    formWidgetsToMap();
    formAutoFill();
    flowPreview();
  },
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

// 将流程组件list转换成map
const formWidgetsToMap = () => {
  flowWidgetMap = FlowManApi.formWidgetListToMap(props.flowWidgets || []);
};

// 自选审批人
let showChooseUser = ref(false);
let choosedUserNodeId = ref(null);
const onChooseUserClicked = (nodeId) => {
  showChooseUser.value = true;
  choosedUserNodeId.value = nodeId;
};
const handleOrganChooseOk = (selected) => {
  flowNodeDesignees.value[choosedUserNodeId.value] = selected;
};

// 校验表单必填项
const validFlowForm = () => {
  let validated = true;
  formErrors.value = [];
  // console.log("校验的组件：", props.flowWidgets);
  if (props.flowWidgets.length == 0) return;
  (props.flowWidgets || []).forEach((flowWidget) => {
    let { name, required, label, type } = flowWidget;
    let formItemValue = flowForm.value[name];
    if (required) {
      // 其他组件
      if (!ObjectUtil.isNotEmpty(formItemValue)) {
        formErrors.value.push(`表单必填项 "${label}" 未填写`);
        validated = false;
      }
    } else if ([WIDGET.DETAIL].includes(type)) {
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
              if (!ObjectUtil.isNotEmpty(detailItemValue)) {
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
  // 表单公式计算结果
  formFormulaAutoCalc(flowForm.value, props.flowWidgets || []);
  // 校验表单
  validFlowForm();
  if (formValidated.value) {
    flowPreviewed.value = false;
    FlowInstApi.viewProcessChart({
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
  if (!!!flowWidgetMap) {
    flowWidgetMap = FlowManApi.formWidgetListToMap(flowWidgets);
  }
  // 处理表单值
  for (let name in flowValue) {
    let widget = flowWidgetMap[name];
    if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(widget.type)) {
      // 取出上传的文件id
      flowValue[name] = (flowValue[name] || []).map((v) => v.id);
    } else if (widget.type == WIDGET.DETAIL) {
      flowValue[name].forEach((flowDetailValue) => {
        for (let detailName in flowDetailValue) {
          let detailWidget = flowWidgetMap[detailName];
          if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(detailWidget.type)) {
            flowDetailValue[detailName] = (flowDetailValue[detailName] || []).map((v) => v.id);
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
    FlowInstApi.flowStart({
      flowDefId: props.flow.id,
      flowValue: JSON.stringify(handleFormValue(props.flowWidgets, ObjectUtil.copy(flowForm.value))),
      designees: formDesignees,
    }).then(
      (resp) => {
        launching.value = false;
        if (resp.code == 1) {
          Message.success(`${props.flow.name}申请成功！`);
          emits("onSuccess");
        }
      },
      () => (launching.value = false)
    );
  } else {
    launching.value = false;
    Message.error({ title: "表单校验", content: "表单必填项需填写完整！" });
  }
};
// 取消
const handleCancel = () => {
  emits("onCancel");
};

// 上传组件列表变化
const handleFileListChange = (fileList, fileItem) => {
  let { response: resp } = fileItem;
  if (!!!resp) return;
  if (resp.code == 1) {
    // 上传成功转换数据
    let data = resp.data;
    data.url = `${FILE_DOWNLOAD_URL}?id=${data.id}`;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].uid == fileItem.uid) {
        fileList[i] = data;
        return;
      }
    }
  } else {
    // 上传失败提示，删除文件
    Message.error(`文件上传失败，原因是：${resp.msg}！`);
    ArrayUtil.remove(fileList, "uid", fileItem.uid);
  }
};

// 弹窗选择流程实例
const selectedFlowInstWidget = ref({});
const onFlowSelectClicked = (widget) => {
  selectedFlowInstWidget.value = widget;
  flowInstSelectVisible.value = true;
};

// 表单自动填充
const formAutoFill = () => {
  let formValue = flowForm.value;
  let widgets = props.flowWidgets || [];
  widgets.forEach((widget) => {
    let { name, type, details } = widget;
    if (WIDGET.DETAIL == type) {
      let detailValue = {};
      formValue[name] = [detailValue];
      (details || []).forEach((detailWidget) => (detailValue[detailWidget.name] = null));
    }
  });
};

// 由于后端表单格式化了, 该处需要反格式化
const formAntiFmt = (form) => {
  for (let name in form) {
    let widget = flowWidgetMap[name];
    let { type } = widget;
    if ([WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
      form[name] = parseFloat(form[name]);
    } else if ([WIDGET.ATTACHMENT].includes(type)) {
      let ids = form[name];
      ids = ids.filter((i) => !!i);
      // 附件需要去查询一下附件名称
      if (ids && ids.length > 0) {
        FileApi.batchMetadata({ ids: ids.join(",") }).then((resp) => {
          let attachments = resp.data || [];
          attachments.forEach((i) => (i.url = `${FILE_DOWNLOAD_URL}?id=${i.id}`));
          form[name] = attachments;
        });
      }
    } else if ([WIDGET.PICTURE].includes(type)) {
      let fileIds = form[name];
      for (let i = 0; i < fileIds.length; i++) {
        let fileId = fileIds[i];
        let data = { id: fileId, url: `${FILE_DOWNLOAD_URL}?id=${fileId}` };
        fileIds[i] = data;
      }
      form[name] = fileIds;
    } else if (type == WIDGET.DETAIL) {
      (form[name] || []).forEach((detail) => formAntiFmt(detail));
    }
  }
};

onBeforeMount(() => {
  formWidgetsToMap();

  // 再次申请，初始化表单
  if (!!props.relaunchFlowForm) {
    flowForm.value = props.relaunchFlowForm;
    formAntiFmt(flowForm.value);
  }

  // 流程预览
  flowPreview();
});
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
      min-height: 32px;
      display: flex;
      align-items: center;

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
            display: flex;
            flex-flow: row wrap;
            gap: 6px;
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
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>

<style lang="less">
.flow-form-container {
  .arco-form {
    .arco-form-item-label-col {
      margin-bottom: 0;

      .arco-form-item-label {
        font-size: 13px;
        color: #999;
      }
    }

    .arco-upload-list.arco-upload-list-type-text .arco-upload-list-item:first-of-type,
    .arco-upload-list.arco-upload-list-type-picture .arco-upload-list-item:first-of-type {
      margin-top: 10px;
    }

    .arco-upload-list-item-operation,
    .arco-upload-list-picture-operation {
      font-size: 16px;

      .arco-icon {
        font-size: 16px;
      }
    }
  }

  .arco-timeline {
    .arco-timeline-item {
      &:last-child {
        min-height: 0;
      }
    }
  }
}
</style>
