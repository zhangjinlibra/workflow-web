<template>
  <!-- 表单信息 -->
  <div class="flow-form-box">
    <template v-for="formWidget in onlyValue ? filteredFormWidgets : formWidgets">
      <template
        v-if="
          [
            WIDGET.SINGLELINE_TEXT,
            WIDGET.NUMBER,
            WIDGET.MONEY,
            WIDGET.SINGLE_CHOICE,
            WIDGET.MULTI_CHOICE,
            WIDGET.DATE,
            WIDGET.DATE_RANGE,
            WIDGET.DEPARTMENT,
            WIDGET.EMPLOYEE,
            WIDGET.AREA,
            WIDGET.MAILBOX,
            WIDGET.MOBILE,
            WIDGET.IDCARD,
            WIDGET.FORMULA,
          ].includes(formWidget.type)
        ">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value">{{ formValue0[formWidget.name] }}</div>
        </div>
      </template>
      <!-- 多行文本 -->
      <template v-else-if="[WIDGET.MULTILINE_TEXT].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value" v-html="newline(formValue0[formWidget.name])"></div>
        </div>
      </template>
      <!-- 富文本 -->
      <template v-else-if="[WIDGET.RICH_TEXT].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value">
            <div class="rich-text w-e-text-container">
              <div v-html="formValue0[formWidget.name]" data-slate-editor></div>
            </div>
          </div>
        </div>
      </template>
      <!-- 网站 -->
      <template v-else-if="[WIDGET.WEBSITE].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value">
            <a class="link" :href="formValue0[formWidget.name]" target="_blank">{{ formValue0[formWidget.name] }}</a>
          </div>
        </div>
      </template>
      <!-- 评分 -->
      <template v-else-if="[WIDGET.RATE].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value">
            <a-rate :default-value="formValue0[formWidget.name]" readonly />
          </div>
        </div>
      </template>
      <!-- 关联审批 -->
      <template v-else-if="[WIDGET.FLOW_INST].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value flow-inst-list">
            <FlowCard v-for="id in formValue0[formWidget.name] || []" :flow-inst-id="id" :clickable="true" />
          </div>
        </div>
      </template>
      <!-- 图片 -->
      <template v-else-if="[WIDGET.PICTURE].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value image-list">
            <img
              v-for="(id, idx) in formValue0[formWidget.name] || []"
              :src="`${FILE_DOWNLOAD_URL}?id=${id}`"
              @click="onImgPreview(idx, formValue0[formWidget.name])" />
          </div>
        </div>
      </template>
      <!-- 附件 -->
      <template v-else-if="[WIDGET.ATTACHMENT].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value">
            <div class="attachment-box">
              <div class="attachment-list" v-for="attachment in formValue0[formWidget.name]">
                <div class="link" @click="onAttachmentDownload(attachment, $event)">
                  {{ attachment ? attachment.name : "" }}
                </div>
                <div class="action"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- 明细 -->
      <template v-else-if="[WIDGET.DETAIL].includes(formWidget.type)">
        <div class="form-item">
          <div class="label">{{ formWidget.label }}</div>
          <div class="value detail-value">
            <a-table
              :data="formValue0[formWidget.name]"
              :pagination="false"
              size="small"
              :scrollbar="false"
              :hoverable="false"
              :bordered="{ cell: true }">
              <template #columns>
                <a-table-column
                  v-for="subWidget in formWidget.details.filter((i) => i.type != WIDGET.DESCRIBE)"
                  :title="subWidget.label"
                  :width="subWidget.type == WIDGET.FLOW_INST ? 300 : 100">
                  <template #cell="{ record }">
                    <!-- 纯文本 -->
                    <template
                      v-if="
                        [
                          WIDGET.SINGLELINE_TEXT,
                          WIDGET.SINGLE_CHOICE,
                          WIDGET.DATE,
                          WIDGET.NUMBER,
                          WIDGET.MONEY,
                          WIDGET.MULTI_CHOICE,
                          WIDGET.DATE_RANGE,
                          WIDGET.DEPARTMENT,
                          WIDGET.EMPLOYEE,
                          WIDGET.AREA,
                          WIDGET.MAILBOX,
                          WIDGET.MOBILE,
                          WIDGET.IDCARD,
                          WIDGET.FORMULA,
                        ].includes(subWidget.type)
                      ">
                      {{ record[subWidget.name] }}
                    </template>
                    <!-- 多行文本 -->
                    <template v-else-if="[WIDGET.MULTILINE_TEXT].includes(subWidget.type)">
                      <span v-html="newline(record[subWidget.name])"></span>
                    </template>
                    <!-- 网站 -->
                    <template v-else-if="[WIDGET.WEBSITE].includes(subWidget.type)">
                      <a class="link" :href="record[subWidget.name]" target="_blank">{{ record[subWidget.name] }}</a>
                    </template>
                    <!-- 评分 -->
                    <template v-else-if="[WIDGET.RATE].includes(subWidget.type)">
                      <a-rate :default-value="record[subWidget.name]" readonly />
                    </template>
                    <!-- 图片 -->
                    <template v-else-if="[WIDGET.PICTURE].includes(subWidget.type)">
                      <div class="image-list">
                        <img
                          v-for="(id, idx) in record[subWidget.name] || []"
                          :src="`${FILE_DOWNLOAD_URL}?id=${id}`"
                          @click="onImgPreview(idx, record[subWidget.name])" />
                      </div>
                    </template>
                    <!-- 附件 -->
                    <template v-else-if="[WIDGET.ATTACHMENT].includes(subWidget.type)">
                      <template v-for="attachment in record[subWidget.name]">
                        <div class="attachment-list">
                          <div class="link" @click="onAttachmentDownload(attachment, $event)">
                            {{ attachment ? attachment.name : "" }}
                          </div>
                          <div class="action"></div>
                        </div>
                      </template>
                    </template>
                    <!-- 关联审批 -->
                    <template v-else-if="[WIDGET.FLOW_INST].includes(subWidget.type)">
                      <div class="flow-inst-list">
                        <FlowCard v-for="id in record[subWidget.name] || []" :flow-inst-id="id" :clickable="true"></FlowCard>
                      </div>
                    </template>
                  </template>
                </a-table-column>
              </template>
            </a-table>
            <!-- 明细汇总 -->
            <div class="detail-amount" v-if="formWidget.formula">
              <div class="name">{{ `${formWidget.label}（合计）` }}</div>
              <div class="amount">
                {{ ObjectUtil.comma((formFormulaDetailCalc(formValue0[formWidget.name], formWidget.formula) || 0).toFixed(2)) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <a-image-preview-group v-model:visible="imagePreviewVisible" v-model:current="currentImageIdx" infinite :srcList="imageList" />
  </div>
</template>

<script setup>
import { FILE_DOWNLOAD_URL } from "@/api/FileApi";
import FlowManApi from "@/api/FlowManApi";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { formFormulaDetailCalc } from "@/components/flow/common/FlowFormula";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { newline } from "@/utils/format";
import { computed, onMounted, ref, toRaw, watch } from "vue";
import FlowCard from "./flow-card.vue";

const props = defineProps({
  flowInst: { type: Object, default: {} },
  formWidgets: { type: Array, default: [] },
  formValue: { type: Object, default: {} },
  onlyValue: { type: Boolean, default: false }, // 只展示表单值相关的组件
});

// const organStore = useOrganStore();
// const { getDeptById, getUserById } = organStore;
const formWidgetMap = ref({});
const formValue0 = ref({});

// 过滤出表单值所涉及的组件列表
const filteredFormWidgets = computed(() => {
  // 过滤出表单所有的key
  let keys = [];
  for (let k in formValue0.value) {
    keys.push(k);
    let v = formValue0.value[k];
    if (v && ObjectUtil.isArray(v)) {
      v.forEach((d) => {
        for (let k0 in d) keys.push(k0);
      });
    }
  }
  let widgets = ObjectUtil.copy(props.formWidgets);
  widgets = widgets.filter((widget) => {
    let { name, details } = widget;
    let ok = keys.includes(name);
    if (ok && details) widget.details = details.filter((detail) => keys.includes(detail.name));
    return ok;
  });
  return widgets;
});

// 格式化表单
const formatFormValue = () => {
  // for (let name in formValue0.value) {
  //   let type = (formWidgetMap.value[name] || {}).type;
  //   if ([WIDGET.ATTACHMENT].includes(type)) {
  //     let ids = formValue0.value[name];
  //     ids = ids.filter((i) => !!i);
  //     if (ids && ids.length > 0) {
  //       FileApi.batchMetadata({ ids: ids.join(",") }).then((resp) => (formValue0.value[name] = resp.data || []));
  //     }
  //   } else if (type == WIDGET.DETAIL) {
  //     (formValue0.value[name] || []).forEach((detailValue) => {
  //       for (let detailName in detailValue) {
  //         let detailType = formWidgetMap.value[detailName].type;
  //         if ([WIDGET.ATTACHMENT].includes(detailType)) {
  //           let ids = detailValue[detailName];
  //           ids = ids.filter((i) => !!i);
  //           if (ids && ids.length > 0) {
  //             FileApi.batchMetadata({ ids: ids.join(",") }).then((resp) => (detailValue[detailName] = resp.data || []));
  //           }
  //         }
  //       }
  //     });
  //   }
  // }
};

// 文件预览
const imagePreviewVisible = ref(false);
const currentImageIdx = ref(0);
const imageList = ref([]);
const onImgPreview = (idx, idList) => {
  currentImageIdx.value = idx || 0;
  imageList.value = (idList || []).map((id) => `${FILE_DOWNLOAD_URL}?id=${id}`);
  imagePreviewVisible.value = true;
};

// 附件下载
const onAttachmentDownload = (attachment, evt) => {
  evt.stopPropagation();
  window.open(`${FILE_DOWNLOAD_URL}?id=${attachment.id}`, "_blank");
};

watch(
  () => props.formValue,
  (nv) => {
    formValue0.value = nv;
    formatFormValue();
  }
);

watch(
  () => props.formWidgets,
  () => {
    formWidgetMap.value = FlowManApi.formWidgetListToMap(props.formWidgets);
    formValue0.value = toRaw(props.formValue);
    formatFormValue();
  }
);

onMounted(() => {
  formWidgetMap.value = FlowManApi.formWidgetListToMap(props.formWidgets);
  formValue0.value = props.formValue;
  formatFormValue();
});
</script>

<style lang="less">
@import "@/styles/rich.text.less";
</style>

<style lang="less" scoped>
@import "@/styles/variables.module.less";
@FormLabelWidth: 84px;

.flow-form-box {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .form-item {
    font-size: 14px;
    display: flex;
    gap: 16px;

    .label {
      color: #9ba5b3;
      width: @FormLabelWidth;
      overflow: hidden;
      white-space: nowrap;
      flex-shrink: 0;
      // display: flex;
      // justify-content: flex-end;
      text-align: right;
    }

    .value {
      color: #1d2129;
      display: flex;
      align-items: flex-start;
      width: calc(100% - @FormLabelWidth - 16px);
      word-wrap: anywhere;
      word-break: break-all;
    }

    .detail-value {
      display: block;
    }

    .detail-amount {
      color: var(--color-text-2);
      height: 20px;
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      justify-content: flex-end;
      gap: 8px;

      .amount {
        font-weight: bold;
      }
    }

    .link {
      // color: #1d2129;
      text-decoration: none;
      cursor: pointer;
      &:hover {
        color: #165cfd;
        text-decoration: underline;
      }
    }

    .rich-text {
      width: 100%;
      border: 1px solid var(--color-neutral-2);
      border-radius: var(--border-radius-medium);
      // border: 0.5px dashed var(--color-neutral-3);
      // background-color: #fafafa;
    }

    .arco-rate {
      min-height: 14px;
      font-size: 14px;
    }
  }

  .flow-inst-list {
    width: 100%;
    display: grid !important;
    grid-template-columns: repeat(auto-fit, @FlowCardWidth);
    gap: 8px;
  }

  .image-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    img {
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }

  .attachment-box {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .attachment-list {
      background-color: #f7f8fa;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
    }
  }

  .form-detail {
    margin-top: 8px;
    border: 1px dashed #e1e1e1;
    border-radius: var(--border-radius-small);

    .detail-title {
      color: var(--color-text-3);
      background-color: #f9fafa;
      padding: 2px;
    }

    .label {
      margin-top: 8px;
    }
  }
}
</style>
