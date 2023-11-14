<template>
  <a-drawer
    class="form-edit-container"
    :width="500"
    :visible="visible"
    :closable="false"
    :mask-closable="false"
    :header="false"
    :footer="false"
    unmountOnClose
    @cancel="onClose()">
    <div class="form-container" v-loading.fullscreen="loading">
      <a-divider orientation="left">编辑审批表单</a-divider>
      <a-form :model="flowForm" layout="vertical" class="flow-form-box">
        <template v-for="widget in formWidgets">
          <a-form-item
            v-if="![WIDGET.DETAIL, WIDGET.DESCRIBE].includes(widget.type)"
            class="field-item"
            :required="widget.required"
            :label="widget.label">
            <template v-if="widget.type == WIDGET.SINGLELINE_TEXT">
              <a-input
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :max-length="64"
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required" />
            </template>
            <template v-else-if="widget.type == WIDGET.MULTILINE_TEXT">
              <a-textarea
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :max-length="128"
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required" />
            </template>
            <template v-else-if="widget.type == WIDGET.NUMBER">
              <a-input-number
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :hide-button="true"
                :max-length="15"
                :formatter="(v) => ObjectUtil.limitScale(v, 4)"
                :allow-clear="!widget.required"
                :placeholder="widget.placeholder" />
            </template>
            <template v-else-if="widget.type == WIDGET.MONEY">
              <a-input-number
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
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
              <a-select
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required">
                <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.MULTI_CHOICE">
              <a-select
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                multiple
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required">
                <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.DATE">
              <a-date-picker
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
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
                :disabled="!widget.editable"
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
                :disabled="!widget.editable"
                :show-remove-button="!!widget.editable"
                :show-upload-button="!!widget.editable"
                list-type="picture-card"
                :image-preview="true"
                :action="fileUploadUrl"
                :headers="fileUploadHeaders"
                :with-credentials="true"
                :limit="10"
                :multiple="true" />
            </template>
            <template v-else-if="widget.type == WIDGET.ATTACHMENT">
              <a-upload
                v-model:file-list="flowForm[widget.name]"
                :disabled="!widget.editable"
                :show-remove-button="!!widget.editable"
                :show-upload-button="!!widget.editable"
                :action="fileUploadUrl"
                :headers="fileUploadHeaders"
                :with-credentials="true"
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
              <a-select
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :placeholder="widget.placeholder"
                allow-search
                :allow-clear="!widget.required">
                <a-option v-for="dept in allDepts || []" :value="dept.id">{{ dept.name }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.EMPLOYEE">
              <a-select
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :placeholder="widget.placeholder"
                allow-search
                :allow-clear="!widget.required">
                <a-option v-for="user in allUsers || []" :value="user.id">{{ user.name }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.AREA">
              <a-cascader
                v-model:model-value="flowForm[widget.name]"
                :disabled="!widget.editable"
                :options="CHINA_AREA"
                allow-search
                path-mode
                expand-trigger="hover"
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required" />
            </template>
            <template v-else-if="widget.type == WIDGET.FLOW_INST">
              <div class="flow-inst-widget">
                <div class="flow-inst-widget-btn" v-if="widget.editable">
                  <a-link @click="onFlowSelectClicked()">
                    <template #icon><icon-plus /></template>添加审批
                  </a-link>
                </div>
                <div class="flow-inst-list">
                  <FlowCard v-for="id in flowForm[widget.name]" :flow-inst-id="id"></FlowCard>
                </div>
                <FlowInstSelect v-model:visible="flowInstSelectVisible" v-model:selected="flowForm[widget.name]" :disabled="[flowInst.id]" />
              </div>
            </template>
          </a-form-item>
          <template v-else-if="widget.type == WIDGET.DESCRIBE">
            <div class="describe"><icon-info-circle />{{ widget.placeholder }}</div>
          </template>
          <template v-else-if="widget.type == WIDGET.DETAIL">
            <FormEditWidgetDetail :widget="widget" :headers="fileUploadHeaders" :url="fileUploadUrl" :form="flowForm" :flow-inst="flowInst" />
          </template>
        </template>
      </a-form>

      <!-- 按钮 -->
      <a-divider orientation="left"></a-divider>
      <section class="flow-btn-box">
        <a-button @click="onClose()">取消</a-button>
        <a-button type="primary" @click="onSave()">保存</a-button>
      </section>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from "vue";
import { useOrganStore } from "@/stores";
import { getToken } from "@/utils/auth";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { IconInfoCircle, IconPlus } from "@arco-design/web-vue/es/icon";
import FlowCard from "./flow-card.vue";
import FlowInstSelect from "./flow-inst-select.vue";
import FormEditWidgetDetail from "./form-edit-widget-detail.vue";
import FlowInstApi from "@/api/FlowInstApi";
import { FILE_BASE_URL } from "@/api/FileApi";

const props = defineProps({
  visible: { type: Boolean, default: false },
  flowInst: { type: Object, default: {} },
  formValue: { type: Object, default: {} },
  formWidgets: { type: Array, default: [] },
});
const emits = defineEmits(["update:visible", "onOk"]);

let { users: allUsers, depts: allDepts } = useOrganStore();
const fileUploadUrl = FILE_BASE_URL + "/upload"; //文件上传地址
const fileUploadHeaders = ref({ Authorization: getToken() }); // 文件上传请求头
const flowForm = ref({}); // 流程表单
const formWidgetMap = ref({}); // 将组件抽成map
const loading = ref(false);

const toMap = (widgets) => {
  let map = {};
  (widgets || []).forEach((widget) => {
    map[widget.name] = widget;
    (widget.details || []).forEach((detail) => {
      map[detail.name] = detail;
    });
  });
  return map;
};

watch(
  () => props.visible,
  (nv) => {
    if (nv) {
      flowForm.value = ObjectUtil.copy(props.formValue);
      formWidgetMap.value = toMap(props.formWidgets);
      fmt(flowForm.value);
    }
  }
);

// 由于后端表单格式化了, 该处需要重新格式化一下
const fmt = (form) => {
  for (let name in form) {
    let widget = formWidgetMap.value[name];
    let { type } = widget;
    if ([WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
      form[name] = parseFloat(form[name]);
    } else if ([WIDGET.ATTACHMENT].includes(type)) {
      let files = form[name];
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let resp = { data: { id: file.id } };
        files[i] = { uid: file.id, url: FILE_BASE_URL + `/download?id=${file.id}`, name: file.name, response: resp };
      }
      form[name] = files;
    } else if ([WIDGET.PICTURE].includes(type)) {
      let fileIds = form[name];
      for (let i = 0; i < fileIds.length; i++) {
        let fileId = fileIds[i];
        let resp = { data: { id: fileId } };
        fileIds[i] = { uid: fileId, url: FILE_BASE_URL + `/download?id=${fileId}`, response: resp };
      }
      form[name] = fileIds;
    } else if (type == WIDGET.DETAIL) {
      (form[name] || []).forEach((detail) => fmt(detail));
    }
  }
};

// 处理表单值
const handleFormValue = (flowValue) => {
  // 处理表单值
  for (let name in flowValue) {
    let widget = formWidgetMap.value[name];
    if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(widget.type)) {
      // 取出上传的文件id
      flowValue[name] = (flowValue[name] || []).map((v) => (v.response || {}).data.id);
    } else if (widget.type == WIDGET.DETAIL) {
      flowValue[name].forEach((flowDetailValue) => {
        for (let detailName in flowDetailValue) {
          let detailWidget = formWidgetMap.value[detailName];
          if ([WIDGET.PICTURE, WIDGET.ATTACHMENT].includes(detailWidget.type)) {
            flowDetailValue[detailName] = (flowDetailValue[detailName] || []).map((v) => (v.response || {}).data.id);
          }
        }
      });
    }
  }
  return flowValue;
};

let flowInstSelectVisible = ref(false); // 是否显示流程选择框
const onFlowSelectClicked = () => {
  flowInstSelectVisible.value = true;
};

const onSave = () => {
  loading.value = true;
  let flowValue = JSON.stringify(handleFormValue(ObjectUtil.copy(flowForm.value)));
  let { id, nodeId, taskId } = props.flowInst;
  FlowInstApi.formModify({
    flowInstId: id,
    flowNodeId: nodeId,
    taskId: taskId,
    flowValue: flowValue,
  })
    .then((resp) => {
      if (resp.code == 1) {
        emits("onOk", resp.data);
        onClose();
      }
      loading.value = false;
    })
    .catch(() => (loading.value = false));
};

const onClose = () => {
  emits("update:visible", false);
};
</script>

<style lang="less">
.form-edit-container {
  .form-container {
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
        min-height: 32px;

        svg {
          margin-right: 5px;
        }
      }
    }

    .flow-btn-box {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 10px;
    }
  }

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
      margin-top: 12px;
    }

    .arco-upload-list-item-operation,
    .arco-upload-list-picture-operation {
      font-size: 16px;

      .arco-icon {
        font-size: 16px;
      }
    }
  }

  .arco-drawer {
    .arco-drawer-footer {
      height: 52px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: end;
    }
  }
}
</style>
