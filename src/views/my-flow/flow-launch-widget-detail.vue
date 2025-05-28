<template>
  <div class="flow-form-detail-box">
    <template v-for="(formDetailVal, idx) in props.form[props.widget.name]">
      <div class="form-detail-val-item">
        <div class="detail-item-title">
          <div class="title">{{ `${widget.label} ${idx + 1}` }}</div>
          <div v-if="props.form[props.widget.name].length > 1" class="icon-button" @click="handleDeleteItem(idx)">
            <icon-delete :size="16" />
          </div>
        </div>
        <template v-for="widget in details">
          <a-form-item v-if="![WIDGET.DESCRIBE].includes(widget.type)" class="field-item" :required="widget.required" :label="widget.label">
            <template v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MAILBOX, WIDGET.MOBILE, WIDGET.IDCARD, WIDGET.WEBSITE].includes(widget.type)">
              <a-input
                v-model:model-value="formDetailVal[widget.name]"
                :max-length="64"
                :allow-clear="!widget.required"
                :placeholder="widget.placeholder" />
            </template>
            <template v-else-if="widget.type == WIDGET.MULTILINE_TEXT">
              <a-textarea
                v-model:model-value="formDetailVal[widget.name]"
                :max-length="128"
                :allow-clear="!widget.required"
                :placeholder="widget.placeholder" />
            </template>
            <template v-else-if="widget.type == WIDGET.NUMBER">
              <a-input-number
                v-model:model-value="formDetailVal[widget.name]"
                :max-length="15"
                :allow-clear="!widget.required"
                :hide-button="true"
                :placeholder="widget.placeholder" />
            </template>
            <template v-else-if="widget.type == WIDGET.MONEY">
              <a-input-number
                v-model:model-value="formDetailVal[widget.name]"
                ::allow-clear="!widget.required"
                :min="0"
                :max-length="15"
                :hide-button="true"
                :formatter="(v) => ObjectUtil.limitScale(v, 2)"
                :placeholder="widget.placeholder">
                <template #append> CNY-人民币元 </template>
              </a-input-number>
            </template>
            <template v-else-if="widget.type == WIDGET.SINGLE_CHOICE">
              <a-select v-model:model-value="formDetailVal[widget.name]" :placeholder="widget.placeholder" :allow-clear="!widget.required">
                <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.MULTI_CHOICE">
              <a-select
                v-model:model-value="formDetailVal[widget.name]"
                multiple
                :allow-clear="!widget.required"
                :placeholder="widget.placeholder">
                <a-option v-for="option in widget.options" :value="option">{{ option }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.DATE">
              <a-date-picker
                v-model:model-value="formDetailVal[widget.name]"
                :allow-clear="!widget.required"
                :value-format="widget.format"
                :show-time="widget.format.includes('H')"
                :format="widget.format"
                :style="{ width: '100%' }"
                :placeholder="widget.placeholder" />
            </template>
            <template v-else-if="widget.type == WIDGET.DATE_RANGE">
              <a-range-picker
                v-model:model-value="formDetailVal[widget.name]"
                :allow-clear="!widget.required"
                :value-format="widget.format"
                :show-time="widget.format.includes('H')"
                :format="widget.format"
                :style="{ width: '100%' }"
                :placeholder="[widget.placeholder, widget.placeholder]" />
            </template>
            <template v-else-if="widget.type == WIDGET.PICTURE">
              <a-upload
                v-model:file-list="formDetailVal[widget.name]"
                list-type="picture-card"
                :image-preview="true"
                :action="url"
                :headers="headers"
                :with-credentials="true"
                :limit="10"
                :multiple="true"
                @change="handleFileListChange" />
            </template>
            <template v-else-if="widget.type == WIDGET.ATTACHMENT">
              <a-upload
                v-model:file-list="formDetailVal[widget.name]"
                :action="url"
                :headers="headers"
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
              <a-select
                v-model:model-value="formDetailVal[widget.name]"
                :placeholder="widget.placeholder"
                allow-search
                :allow-clear="!widget.required">
                <a-option v-for="dept in allDepts || []" :value="dept.id">{{ dept.name }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.EMPLOYEE">
              <a-select
                v-model:model-value="formDetailVal[widget.name]"
                :placeholder="widget.placeholder"
                allow-search
                :allow-clear="!widget.required">
                <a-option v-for="user in allUsers || []" :value="user.id">{{ user.name }}</a-option>
              </a-select>
            </template>
            <template v-else-if="widget.type == WIDGET.AREA">
              <a-cascader
                v-model:model-value="formDetailVal[widget.name]"
                :options="CHINA_AREA"
                allow-search
                path-mode
                expand-trigger="hover"
                :placeholder="widget.placeholder"
                :allow-clear="!widget.required">
              </a-cascader>
            </template>
            <template v-else-if="widget.type == WIDGET.FLOW_INST">
              <div class="flow-inst-widget">
                <div class="flow-inst-widget-btn">
                  <a-link @click="handleFlowSelectClicked(widget)">
                    <template #icon><icon-plus /></template>添加审批
                  </a-link>
                </div>
                <div class="flow-inst-list">
                  <FlowCard v-for="id in formDetailVal[widget.name]" :flow-inst-id="id"></FlowCard>
                </div>
                <FlowInstSelect
                  v-if="showFlowSelect"
                  v-model:visible="showFlowSelect"
                  v-model:selected="formDetailVal[selectedFlowInstWidget.name]"></FlowInstSelect>
              </div>
            </template>
            <template v-else-if="widget.type == WIDGET.RATE">
              <a-rate v-model:model-value="formDetailVal[widget.name]" allow-half allow-clear />
            </template>
            <template v-else-if="widget.type == WIDGET.FORMULA">
              <a-input v-model:model-value="formDetailVal[widget.name]" :placeholder="`=${widget.placeholder || ''}`" disabled />
            </template>
          </a-form-item>
          <template v-else-if="widget.type == WIDGET.DESCRIBE">
            <div class="describe"><icon-info-circle />{{ widget.placeholder }}</div>
            <!-- <a-textarea :placeholder="widget.placeholder" :disabled="true" /> -->
          </template>
        </template>
      </div>
    </template>
    <a-button class="add-one-detail" long @click="handleAddItem(widget)">
      添加{{ widget.label }}
      <template #icon> <icon-plus /> </template>
    </a-button>

    <!-- <div class="amount-wrapper">
      <div class="amount-item" v-for="item in amountValues">
        <div class="amount-name">{{ props.widget.label }}（合计）</div>
        <div class="amout-total">
          <div class="money">{{ ObjectUtil.comma((item.total || 0).toFixed(2)) }}</div>
          <div class="unit">CNY-人民币元</div>
        </div>
      </div>
    </div> -->
    <div class="amount-wrapper" v-if="props.widget.formula">
      <div class="amount-item">
        <div class="amount-name">{{ props.widget.label }}（合计）</div>
        <div class="amout-total">
          <div class="money">{{ ObjectUtil.comma((formulaValue || 0).toFixed(2)) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FILE_DOWNLOAD_URL } from "@/api/FileApi";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { formulaEval } from "@/components/flow/common/FlowFormula";
import ObjectUtil from "@/components/flow/common/ObjectUtil";
import { useOrganStore } from "@/stores";
import { Message } from "@arco-design/web-vue";
import { IconDelete, IconInfoCircle, IconPlus } from "@arco-design/web-vue/es/icon";
import { computed, onBeforeMount, ref, watch } from "vue";
import FlowCard from "./flow-card.vue";
import FlowInstSelect from "./flow-inst-select.vue";

let props = defineProps({
  url: { type: String },
  headers: { type: Object, default: () => {} },
  widget: { type: Object, default: () => {} },
  form: { type: Object, default: () => {} },
});

let { users: allUsers, depts: allDepts } = useOrganStore();

let details = computed(() => props.widget.details);
// let detailVals = computed(() => props.form[props.widget.name]);
let names = props.widget.details.map((i) => i.name);

// let amountWidgets = computed(() => {
//   return props.widget.details.filter((item) => item.type == WIDGET.MONEY);
// });
// let amountValues = ref([]);

// 明细组件计算公式
let formulaWidgets = computed(() => {
  let widgets = props.widget.details || [];
  return widgets.filter((item) => item.required && [WIDGET.MONEY, WIDGET.NUMBER].includes(item.type));
}); // 可以作为明细计算公式的组件
let formulaValue = ref(0); // 明细计算公式值

// 关联审批
let showFlowSelect = ref(false); // 是否显示流程选择框
const selectedFlowInstWidget = ref({}); // 当前选中的流程实例组件
const handleFlowSelectClicked = (widget) => {
  selectedFlowInstWidget.value = widget;
  showFlowSelect.value = true;
};

watch(
  props.form,
  () => {
    // 明细组件值
    let values = props.form[props.widget.name] || [];
    let formula = props.widget.formula;
    let widgets = formulaWidgets.value;
    if (!!formula) {
      let amount = 0; // 明细公式合计
      values.forEach((item) => (amount += formulaEval(formula, item)));
      formulaValue.value = amount;
    }
  },
  { deep: true, immediate: true }
);

const initVal = () => {
  let nv = {};
  names.forEach((name) => (nv[name] = null));
  return nv;
};

const handleAddItem = () => {
  let detailValues = props.form[props.widget.name];
  if (!detailValues) {
    props.form[props.widget.name] = [initVal()];
  } else {
    detailValues.push(initVal());
  }
};

const handleDeleteItem = (idx) => {
  let val = props.form[props.widget.name];
  val.splice(idx, 1);
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

onBeforeMount(() => {
  // handleAddItem();
});
</script>

<style lang="less" scoped>
.flow-form-detail-box {
  // border: 1px solid #e5e6ec;

  .form-detail-val-item {
    border: 1px solid #e5e6ec;
    border-radius: 4px;
    overflow: hidden;

    .detail-item-title {
      background-color: #f2f3f5;
      padding: 4px 8px;
      color: var(--color-text-3);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
    }

    .describe {
      color: var(--color-text-2);
      font-size: 13px;
      background-color: var(--color-fill-2);
      border-radius: var(--border-radius-small);
      padding: 4px 12px;
      cursor: default;
      margin: 0 10px 10px;
      min-height: 32px;
      display: flex;
      align-items: center;

      svg {
        margin-right: 5px;
      }
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

    .arco-form-item {
      margin-bottom: 8px;
      padding: 0 10px;
    }

    + .form-detail-val-item {
      margin-top: 10px;
    }
  }

  .add-one-detail {
    margin-top: 8px;
    margin-bottom: 10px;
  }

  .amount-wrapper {
    background-color: #e0eaff;
    border-radius: 4px;
    margin-bottom: 10px;

    .amount-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      user-select: none;
      height: 32px;
      padding: 0 12px;

      + .amount-item {
        border-top: 1px solid #d2d5e8;
      }

      .amount-name {
        color: #4e5969;
      }

      .amout-total {
        display: flex;
        align-items: center;

        .money {
          color: #1d2129;
          font-weight: bold;
          font-size: 16px;
        }

        .unit {
          color: #1d2129;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
