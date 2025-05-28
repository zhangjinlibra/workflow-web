<template>
  <section class="form-make-box">
    <!-- 左侧控件列表 -->
    <div class="form-fields-box">
      <div class="fields-top">控件</div>
      <div class="fields-main">
        <div class="fields-box" v-for="item in fields">
          <div class="title">{{ item.label }}</div>
          <draggable
            class="field-box-wrap"
            v-model="item.fields"
            :clone="handleWidgetClone"
            v-bind="{ group: { name: 'widgets', pull: 'clone', put: false }, animation: 200, ghostClass: 'ghost', sort: false }"
            item-key="type">
            <template #item="{ element }">
              <div class="field-box">
                <div class="field-name">{{ element.label }}</div>
                <div v-if="element.icon.indexOf('widget') == -1" class="field-icon iconfont-approval-admin" v-html="element.icon"></div>
                <div v-else class="field-icon">
                  <svg-icon style="font-size: 20px" :icon-class="element.icon" />
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- 中间表单区域 -->
    <div class="form-layout-box">
      <div class="mobile-box">
        <div class="mobile">
          <template v-if="widgets.length == 0">
            <div class="blank-tip">拖拽左侧控件至此处</div>
          </template>
          <draggable
            class="choosed-widgets-box"
            v-bind="{ group: { name: 'widgets' }, animation: 200, ghostClass: 'ghost' }"
            :list="widgets"
            handle=".widget-move"
            @change="handleWidgetChange($event)"
            item-key="name">
            <template #item="{ element }">
              <div
                :class="[
                  'field-widget',
                  element.focus ? 'field-widget-focus' : '',
                  formulaErrorWidgetNames.includes(element.name) ? 'field-widget-error' : '',
                ]"
                @click="handleWidgetClick(element)">
                <template v-if="element.focus">
                  <div class="widget-move"><icon-drag-arrow :size="12" /></div>
                  <div class="widget-delete" @click.stop.prevent="handleWidgetDelete(element)"><icon-close :size="12" /></div>
                </template>
                <template v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MAILBOX, WIDGET.MOBILE, WIDGET.IDCARD, WIDGET.WEBSITE].includes(element.type)">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-input :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.MULTILINE_TEXT">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-textarea :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.RICH_TEXT">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-textarea :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.DESCRIBE">
                  <div :class="['form-item', 'form-tip']">
                    <div class="prompt">{{ element.placeholder }}</div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.NUMBER">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-input-number :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.MONEY">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-input-number :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.SINGLE_CHOICE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-select :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.MULTI_CHOICE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-select :multiple="true" :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.DATE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-date-picker :style="{ width: '100%' }" :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.DATE_RANGE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-range-picker :placeholder="[element.placeholder, element.placeholder]" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.DETAIL">
                  <widget-detail
                    :widget="element"
                    :formulaErrorWidgetNames="formulaErrorWidgetNames"
                    @click="handleWidgetClick"
                    @delete="handleWidgetDelete"
                    @change="handleWidgetChange"></widget-detail>
                </template>
                <template v-else-if="element.type == WIDGET.PICTURE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-button disabled>
                        <template #icon><icon-plus /></template>点击上传
                      </a-button>
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.ATTACHMENT">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-button disabled>
                        <template #icon><icon-plus /></template>点击上传
                      </a-button>
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.DEPARTMENT">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-select :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.EMPLOYEE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-select :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.AREA">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-cascader :options="CHINA_AREA" :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.FLOW_INST">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-button disabled>
                        <template #icon><icon-plus /></template>选择审批
                      </a-button>
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.RATE">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-rate allow-half allow-clear :disabled="true" />
                    </div>
                  </div>
                </template>
                <template v-else-if="element.type == WIDGET.FORMULA">
                  <div :class="['form-item', element.required ? 'required' : '']">
                    <div class="form-item-name">{{ element.label }}</div>
                    <div class="form-item-widget">
                      <a-input :placeholder="element.placeholder" :disabled="true" />
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
    <div class="form-setting-box"></div>

    <!-- 右侧控件设置 -->
    <a-drawer
      :width="360"
      popup-container=".form-setting-box"
      :mask="false"
      :closable="false"
      :footer="false"
      :visible="showSettingDetail"
      @ok="handleSettingDetailSave"
      @cancel="handleSettingDetailClose"
      unmountOnClose>
      <template #title> {{ (fieldSetting[widget.type] || {}).label || "" }} </template>
      <div>
        <a-form :model="widget" layout="vertical">
          <!-- 组件标题 -->
          <a-form-item field="name" label="标题" v-if="![WIDGET.DESCRIBE].includes(widget.type)">
            <a-input v-model="widget.label" :max-length="16" />
          </a-form-item>
          <!-- 组件提示 -->
          <a-form-item field="placeholder" label="提示" v-if="![WIDGET.DETAIL, WIDGET.FORMULA].includes(widget.type)">
            <a-input v-if="![WIDGET.DESCRIBE].includes(widget.type)" v-model="widget.placeholder" :max-length="16" />
            <a-textarea v-else v-model="widget.placeholder" :max-length="64" />
          </a-form-item>
          <!-- 组件单位 -->
          <a-form-item field="unit" label="单位" v-if="[WIDGET.NUMBER].includes(widget.type)">
            <a-input v-model="widget.unit" :max-length="8" />
          </a-form-item>
          <!-- 组件选项 -->
          <a-form-item field="options" label="选项" v-if="[WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(widget.type)">
            <div class="select-options-box">
              <div class="option-item" v-for="(option, idx) in widget.options">
                <div class="option"><a-input v-model:model-value="widget.options[idx]" :max-length="16" /></div>
                <div class="delete" v-if="widget.options.length > 1" @click="handleDeleteWidgetOption(widget, idx)">
                  <icon-close :size="16" />
                </div>
              </div>
              <a-link @click="handleAddWidgetOption(widget)">
                添加选项 <template #icon> <icon-plus /> </template>
              </a-link>
            </div>
          </a-form-item>
          <!-- 组件格式 -->
          <a-form-item label="格式" v-if="[WIDGET.MONEY].includes(widget.type)">
            <a-grid :cols="1">
              <!-- <a-grid-item><a-checkbox v-model:model-value="widget.locale">显示大写金额</a-checkbox></a-grid-item> -->
              <a-grid-item><a-checkbox v-model:model-value="widget.comma">显示千位分隔符</a-checkbox></a-grid-item>
            </a-grid>
          </a-form-item>
          <!-- 组件日期类型 -->
          <a-form-item label="日期类型" v-if="[WIDGET.DATE, WIDGET.DATE_RANGE].includes(widget.type)">
            <a-radio-group direction="vertical" v-model:model-value="widget.format">
              <a-radio value="YYYY-MM-DD">年-月-日</a-radio>
              <a-radio value="YYYY-MM-DD HH:mm">年-月-日 时:分</a-radio>
            </a-radio-group>
          </a-form-item>
          <!-- 组件是否必填/显示摘要 -->
          <a-form-item label="其他选项" v-if="![WIDGET.DESCRIBE, WIDGET.DETAIL, WIDGET.FORMULA].includes(widget.type)">
            <a-grid :cols="1">
              <a-grid-item>
                <a-checkbox v-model:model-value="widget.required">必填</a-checkbox>
              </a-grid-item>
              <a-grid-item
                v-if="
                  ![WIDGET.MULTILINE_TEXT, WIDGET.PICTURE, WIDGET.ATTACHMENT, WIDGET.FLOW_INST, WIDGET.RICH_TEXT, WIDGET.RATE].includes(
                    widget.type
                  ) && isNotInDetailWidget(widget)
                ">
                <a-checkbox v-model:model-value="widget.summary">显示为摘要</a-checkbox>
              </a-grid-item>
            </a-grid>
          </a-form-item>
          <!-- 计算公式 -->
          <a-form-item label="单项公式" v-if="[WIDGET.DETAIL, WIDGET.FORMULA].includes(widget.type)">
            <div class="formula-box">
              <div class="formula-text" v-if="widget.formulaItems">{{ widget.formulaItems.map((item) => item.name).join("") }}</div>
              <a-link class="formula-btn" @click="handleFormulaOpen">
                设置公式 <template #icon> <SvgIcon icon-class="btn-formula" /> </template>
              </a-link>
            </div>
          </a-form-item>
        </a-form>

        <!-- 计算公式 -->
        <Formula v-model:visible="isFormulaOpened" :widgets="formulaWidgets" :formula-items="widget.formulaItems" @ok="handleFormulaOk" />
      </div>
    </a-drawer>
  </section>
</template>

<script setup>
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { formulaWidgetVerify } from "@/components/flow/common/FlowFormula";
import Snowflake from "@/components/flow/common/Snowflake";
import Formula from "@/components/flow/dialog/Formula.vue";
import { useFlowStore } from "@/stores/index";
import { Message } from "@arco-design/web-vue";
import { IconClose, IconDragArrow, IconPlus } from "@arco-design/web-vue/es/icon";
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import draggable from "vuedraggable";
import WidgetDetail from "./WidgetDetail.vue";

// 流程定义对象
let { flowDefinition } = useFlowStore();

// 左侧属性
let fieldSetting = reactive({
  [WIDGET.SINGLELINE_TEXT]: { label: "单行文本", prefix: "INPUT" },
  [WIDGET.MULTILINE_TEXT]: { label: "多行文本", prefix: "TEXT" },
  [WIDGET.DESCRIBE]: { label: "提示文字", prefix: "TIP" },
  [WIDGET.NUMBER]: { label: "数字", prefix: "NUM" },
  [WIDGET.MONEY]: { label: "金额", prefix: "MONEY" },
  [WIDGET.SINGLE_CHOICE]: { label: "单选", prefix: "SELECT" },
  [WIDGET.MULTI_CHOICE]: { label: "多选", prefix: "MULTISELECT" },
  [WIDGET.DATE]: { label: "日期", prefix: "DATE" },
  [WIDGET.DATE_RANGE]: { label: "日期区间", prefix: "DATERANGE" },
  [WIDGET.DETAIL]: { label: "明细", prefix: "DETAIL" },
  [WIDGET.PICTURE]: { label: "图片", prefix: "IMG" },
  [WIDGET.ATTACHMENT]: { label: "附件", prefix: "ATTACH" },
  [WIDGET.DEPARTMENT]: { label: "部门", prefix: "DEPT" },
  [WIDGET.EMPLOYEE]: { label: "员工", prefix: "STAFF" },
  [WIDGET.ADDRESS]: { label: "地址", prefix: "ADDR" },
  [WIDGET.FLOW_INST]: { label: "关联审批", prefix: "FLOW" },
  [WIDGET.AREA]: { label: "省市区", prefix: "AERA" },
  [WIDGET.MAILBOX]: { label: "邮箱", prefix: "MAILBOX" },
  [WIDGET.MOBILE]: { label: "手机号", prefix: "MOBILE" },
  [WIDGET.IDCARD]: { label: "身份证号", prefix: "IDCARD" },
  [WIDGET.WEBSITE]: { label: "网址", prefix: "WEBSITE" },
  [WIDGET.RATE]: { label: "评分", prefix: "RATE" },
  [WIDGET.RICH_TEXT]: { label: "富文本", prefix: "RICHTEXT" },
  [WIDGET.FORMULA]: { label: "公式", prefix: "FORMULA" },
});

let fieldText = ref([
  { type: WIDGET.SINGLELINE_TEXT, label: fieldSetting[WIDGET.SINGLELINE_TEXT].label, placeholder: "请输入", icon: "&#xe61f" },
  { type: WIDGET.MULTILINE_TEXT, label: fieldSetting[WIDGET.MULTILINE_TEXT].label, placeholder: "请输入", icon: "&#xe616" },
  { type: WIDGET.RICH_TEXT, label: fieldSetting[WIDGET.RICH_TEXT].label, placeholder: "请输入", icon: "widget-rich-text" },
  { type: WIDGET.DESCRIBE, label: fieldSetting[WIDGET.DESCRIBE].label, placeholder: "说明", icon: "&#xe612" },
]);
let fieldNum = ref([
  { type: WIDGET.NUMBER, label: fieldSetting[WIDGET.NUMBER].label, placeholder: "请输入数字", icon: "&#xe625" },
  { type: WIDGET.MONEY, label: fieldSetting[WIDGET.MONEY].label, placeholder: "请输入金额", icon: "&#xe60b" },
]);
let fieldSelect = ref([
  { type: WIDGET.SINGLE_CHOICE, label: fieldSetting[WIDGET.SINGLE_CHOICE].label, placeholder: "请选择", icon: "&#xe637" },
  { type: WIDGET.MULTI_CHOICE, label: fieldSetting[WIDGET.MULTI_CHOICE].label, placeholder: "请选择", icon: "&#xe621" },
]);
let fieldDate = ref([
  { type: WIDGET.DATE, label: fieldSetting[WIDGET.DATE].label, placeholder: "请选择日期", icon: "&#xe60c" },
  { type: WIDGET.DATE_RANGE, label: fieldSetting[WIDGET.DATE_RANGE].label, placeholder: "请选择日期区间", icon: "&#xe610" },
]);
let fieldOther = ref([
  { type: WIDGET.DETAIL, label: fieldSetting[WIDGET.DETAIL].label, icon: "widget-detail" },
  { type: WIDGET.PICTURE, label: fieldSetting[WIDGET.PICTURE].label, icon: "&#xe611" },
  { type: WIDGET.ATTACHMENT, label: fieldSetting[WIDGET.ATTACHMENT].label, icon: "widget-attachment" },
  { type: WIDGET.DEPARTMENT, label: fieldSetting[WIDGET.DEPARTMENT].label, placeholder: "请选择部门", icon: "widget-deptment" },
  { type: WIDGET.EMPLOYEE, label: fieldSetting[WIDGET.EMPLOYEE].label, placeholder: "请选择员工", icon: "widget-employee" },
  { type: WIDGET.FLOW_INST, label: fieldSetting[WIDGET.FLOW_INST].label, placeholder: "请选择审批", icon: "&#xe61a" },
  { type: WIDGET.AREA, label: fieldSetting[WIDGET.AREA].label, placeholder: "请选择区域", icon: "widget-city" },
  // { type: WIDGET.MAILBOX, label: fieldSetting[WIDGET.MAILBOX].label, placeholder: "请输入邮箱", icon: "widget-mailbox" },
  // { type: WIDGET.MOBILE, label: fieldSetting[WIDGET.MOBILE].label, placeholder: "请输入手机号码", icon: "widget-mobile" },
  // { type: WIDGET.IDCARD, label: fieldSetting[WIDGET.IDCARD].label, placeholder: "请输入身份证号码", icon: "widget-idcard" },
  // { type: WIDGET.WEBSITE, label: fieldSetting[WIDGET.WEBSITE].label, placeholder: "请输入网址", icon: "widget-website" },
  { type: WIDGET.RATE, label: fieldSetting[WIDGET.RATE].label, placeholder: "请输入评分", icon: "widget-rate" },
  { type: WIDGET.FORMULA, label: fieldSetting[WIDGET.FORMULA].label, icon: "widget-formula" },
]);
let fields = ref([
  { label: "文本", fields: fieldText },
  { label: "数值", fields: fieldNum },
  { label: "选项", fields: fieldSelect },
  { label: "日期", fields: fieldDate },
  { label: "其他", fields: fieldOther },
]);
let widgets = ref([]); // 表单组件列表
let widget = ref({}); // 点击选中的组件

// 中间表单区域
const handleWidgetClone = (widget) => {
  let nv = JSON.parse(JSON.stringify(widget));
  nv.name = fieldSetting[widget.type].prefix + "_" + Snowflake.generate();
  delete nv.icon;
  if ([WIDGET.DETAIL].includes(nv.type)) {
    nv.details = [];
  } else if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(nv.type)) {
    nv.options = [""];
  } else if ([WIDGET.DATE, WIDGET.DATE_RANGE].includes(nv.type)) {
    nv.format = "YYYY-MM-DD";
  }
  return nv;
};
const handleWidgetClick = (ele) => {
  console.log("选中组件", ele);
  const focusWidget = (ws) =>
    ws.forEach((i) => {
      i.focus = i.name == ele.name;
      if (i.type == WIDGET.DETAIL) focusWidget(i.details);
    });
  focusWidget(widgets.value);
  widget.value = ele;
  showSettingDetail.value = true;
};
const handleWidgetDelete = (ele) => {
  console.log("删除组件", ele);
  let name = ele.name;
  ArrayUtil.remove(widgets.value, "name", name);
  widgets.value.forEach((i) => {
    if (i.type == WIDGET.DETAIL) ArrayUtil.remove(i.details, "name", name);
  });
  widget.value = {};
  showSettingDetail.value = false;
};
const handleWidgetChange = (evt) => {
  let added = evt.added;
  if (added && added.element) {
    handleWidgetClick(added.element);
  }
};
// 右侧控件设置
let showSettingDetail = ref(false);
const handleSettingDetailClose = () => {
  showSettingDetail.value = false;
};
const handleSettingDetailSave = () => {
  handleSettingDetailClose();
};
const handleAddWidgetOption = (widget) => {
  widget.options.push("");
};
const handleDeleteWidgetOption = (widget, idx) => {
  widget.options.splice(idx, 1);
};
const isNotInDetailWidget = (widget) => {
  for (let i = 0; i < widgets.value.length; i++) {
    if (widgets.value[i].name == widget.name) return true;
  }
  return false;
};
// 计算公式
const isFormulaOpened = ref(false);
const formulaWidgets = ref([]);
const formulaErrorWidgetNames = ref([]); // 校验计算公式组件引用的数值组件
const handleFormulaOpen = () => {
  let detailWidgets = []; // 所有明细组件
  let level1WidgetNames = (widgets.value || []).map((widget) => {
    if (widget.type == WIDGET.DETAIL) detailWidgets.push(widget);
    return widget.name;
  }); // 所有一级组件
  let { name, type } = widget.value;
  if (level1WidgetNames.includes(name)) {
    if (type == WIDGET.DETAIL) {
      formulaWidgets.value = (widget.value.details || []).filter((i) => {
        return i.required && [WIDGET.NUMBER, WIDGET.MONEY].includes(i.type);
      });
    } else if (type == WIDGET.FORMULA) {
      formulaWidgets.value = (widgets.value || []).filter((i) => {
        let { required, type } = i;
        return (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) || type == WIDGET.DETAIL;
      });
    }
  } else {
    // 明细中的公式组件
    if (type == WIDGET.FORMULA) {
      for (let detailWidget of detailWidgets) {
        let { details } = detailWidget;
        let detailWidgetNames = (details || []).map((detailWidget) => detailWidget.name);
        if (detailWidgetNames.includes(name)) {
          formulaWidgets.value = (details || []).filter((i) => {
            return i.required && [WIDGET.NUMBER, WIDGET.MONEY].includes(i.type);
          });
          break;
        }
      }
    }
  }

  // 打开弹窗
  isFormulaOpened.value = true;
};
const handleFormulaOk = (formulaItems) => {
  if (formulaItems && formulaItems.length) {
    widget.value.formulaItems = formulaItems;
    // 清除掉该组件的错误提示
    if (formulaErrorWidgetNames.value) {
      formulaErrorWidgetNames.value = formulaErrorWidgetNames.value.filter((i) => i != widget.value.name);
    }
  } else {
    delete widget.value.formulaItems;
  }
};

// 监听组件变化
watch(
  widgets,
  (newVal) => {
    formulaErrorWidgetNames.value = formulaWidgetVerify(newVal);
  },
  { deep: true }
);

// 组件校验
const validate = () => {
  if (formulaErrorWidgetNames.value && formulaErrorWidgetNames.value.length) {
    Message.error(`算数表达式格式有误！`);
    return false;
  }
  return true;
};

// 组件初始化
onMounted(() => {
  if (!!!flowDefinition.flowWidgets) {
    flowDefinition.flowWidgets = [];
  }
  widgets.value = flowDefinition.flowWidgets;

  // 初始化组件focus
  widgets.value.forEach((i) => {
    if (i.focus) handleWidgetClick(i);
    if ([WIDGET.DETAIL].includes(i.type)) i.details.forEach((ii) => ii.focus && handleWidgetClick(i));
  });
});

onBeforeMount(() => {
  document.body.ondrop = function (event) {
    event.preventDefault();
    event.stopPropagation();
  };
});

defineExpose({
  validate,
});
</script>

<style scoped lang="less">
@import "./form-make.less";
</style>
