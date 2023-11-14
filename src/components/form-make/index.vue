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
            :clone="onWidgetClone"
            v-bind="{ group: { name: 'widgets', pull: 'clone', put: false }, animation: 200, ghostClass: 'ghost', sort: false }"
            item-key="type">
            <template #item="{ element }">
              <div class="field-box">
                <div class="field-name">{{ element.label }}</div>
                <div class="field-icon iconfont-approval-admin" v-html="element.icon"></div>
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
            @change="onWidgetChange($event)"
            item-key="name">
            <template #item="{ element }">
              <div :class="['field-widget', element.focus ? 'field-widget-focus' : '']" @click="onWidgetClick(element)">
                <template v-if="element.focus">
                  <div class="widget-move"><icon-drag-arrow :size="12" /></div>
                  <div class="widget-delete" @click.stop.prevent="onWidgetDelete(element)"><icon-close :size="12" /></div>
                </template>
                <template v-if="element.type == WIDGET.SINGLELINE_TEXT">
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
                  <widget-detail :widget="element" @click="onWidgetClick" @delete="onWidgetDelete" @change="onWidgetChange"></widget-detail>
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
      @ok="onSettingDetailSave"
      @cancel="onSettingDetailClose"
      unmountOnClose>
      <template #title> {{ (fieldSetting[widget.type] || {}).label || "" }} </template>
      <div>
        <a-form :model="widget" layout="vertical">
          <a-form-item field="name" label="标题" v-if="![WIDGET.DESCRIBE].includes(widget.type)">
            <a-input v-model="widget.label" :max-length="16" />
          </a-form-item>
          <a-form-item field="placeholder" label="提示">
            <a-input v-if="![WIDGET.DESCRIBE].includes(widget.type)" v-model="widget.placeholder" :max-length="16" />
            <a-textarea v-else v-model="widget.placeholder" :max-length="64" />
          </a-form-item>
          <a-form-item field="unit" label="单位" v-if="[WIDGET.NUMBER].includes(widget.type)">
            <a-input v-model="widget.unit" :max-length="8" />
          </a-form-item>
          <a-form-item field="options" label="选项" v-if="[WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(widget.type)">
            <div class="select-options-box">
              <div class="option-item" v-for="(option, idx) in widget.options">
                <div class="option"><a-input v-model:model-value="widget.options[idx]" :max-length="16" /></div>
                <div class="delete" v-if="widget.options.length > 1" @click="onDeleteWidgetOption(widget, idx)"><icon-close :size="16" /></div>
              </div>
              <a-link @click="onAddWidgetOption(widget)">
                添加选项 <template #icon> <icon-plus /> </template>
              </a-link>
            </div>
          </a-form-item>
          <a-form-item label="格式" v-if="[WIDGET.MONEY].includes(widget.type)">
            <a-grid :cols="1">
              <!-- <a-grid-item><a-checkbox v-model:model-value="widget.locale">显示大写数字</a-checkbox></a-grid-item> -->
              <a-grid-item><a-checkbox v-model:model-value="widget.comma">显示千位分隔符</a-checkbox></a-grid-item>
            </a-grid>
          </a-form-item>
          <a-form-item label="日期类型" v-if="[WIDGET.DATE, WIDGET.DATE_RANGE].includes(widget.type)">
            <a-radio-group direction="vertical" v-model:model-value="widget.format">
              <a-radio value="YYYY-MM-DD">年-月-日</a-radio>
              <a-radio value="YYYY-MM-DD HH:mm">年-月-日 时:分</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="其他选项" v-if="![WIDGET.DESCRIBE, WIDGET.DETAIL].includes(widget.type)">
            <a-grid :cols="1">
              <a-grid-item>
                <a-checkbox v-model:model-value="widget.required">必填</a-checkbox>
              </a-grid-item>
              <a-grid-item
                v-if="
                  ![WIDGET.MULTILINE_TEXT, WIDGET.PICTURE, WIDGET.ATTACHMENT, WIDGET.FLOW_INST].includes(widget.type) &&
                  isNotInDetailWidget(widget)
                ">
                <a-checkbox v-model:model-value="widget.summary">显示为摘要</a-checkbox>
              </a-grid-item>
            </a-grid>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </section>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, reactive } from "vue";
import { useFlowStore } from "@/stores/index";
import draggable from "vuedraggable";
import WidgetDetail from "./WidgetDetail.vue";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import Snowflake from "@/components/flow/common/Snowflake";
import { IconDragArrow, IconClose, IconPlus } from "@arco-design/web-vue/es/icon";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import CHINA_AREA from "@/components/flow/common/ChinaArea";

// 流程定义对象
let { flowDefinition } = useFlowStore();

// 左侧属性
let fieldSetting = reactive({});
fieldSetting[WIDGET.SINGLELINE_TEXT] = { label: "单行文本", prefix: "INPUT" };
fieldSetting[WIDGET.MULTILINE_TEXT] = { label: "多行文本", prefix: "TEXT" };
fieldSetting[WIDGET.DESCRIBE] = { label: "提示文字", prefix: "TIP" };
fieldSetting[WIDGET.NUMBER] = { label: "数字", prefix: "NUM" };
fieldSetting[WIDGET.MONEY] = { label: "金额", prefix: "MONEY" };
fieldSetting[WIDGET.SINGLE_CHOICE] = { label: "单选", prefix: "SELECT" };
fieldSetting[WIDGET.MULTI_CHOICE] = { label: "多选", prefix: "MULTISELECT" };
fieldSetting[WIDGET.DATE] = { label: "日期", prefix: "DATE" };
fieldSetting[WIDGET.DATE_RANGE] = { label: "日期区间", prefix: "DATERANGE" };
fieldSetting[WIDGET.DETAIL] = { label: "明细", prefix: "DETAIL" };
fieldSetting[WIDGET.PICTURE] = { label: "图片", prefix: "IMG" };
fieldSetting[WIDGET.ATTACHMENT] = { label: "附件", prefix: "ATTACH" };
fieldSetting[WIDGET.DEPARTMENT] = { label: "部门", prefix: "DEPT" };
fieldSetting[WIDGET.EMPLOYEE] = { label: "员工", prefix: "STAFF" };
fieldSetting[WIDGET.ADDRESS] = { label: "地址", prefix: "ADDR" };
fieldSetting[WIDGET.FLOW_INST] = { label: "关联审批", prefix: "FLOW" };
fieldSetting[WIDGET.AREA] = { label: "省市区", prefix: "AERA" };

let fieldText = ref([
  { type: WIDGET.SINGLELINE_TEXT, label: fieldSetting[WIDGET.SINGLELINE_TEXT].label, placeholder: "请输入", icon: "&#xe61f" },
  { type: WIDGET.MULTILINE_TEXT, label: fieldSetting[WIDGET.MULTILINE_TEXT].label, placeholder: "请输入", icon: "&#xe616" },
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
  { type: WIDGET.DATE_RANGE, label: fieldSetting[WIDGET.DATE_RANGE].label, placeholder: "请选择日期", icon: "&#xe610" },
]);
let fieldEtc = ref([
  { type: WIDGET.DETAIL, label: fieldSetting[WIDGET.DETAIL].label, icon: "&#xe60d" },
  { type: WIDGET.PICTURE, label: fieldSetting[WIDGET.PICTURE].label, icon: "&#xe611" },
  { type: WIDGET.ATTACHMENT, label: fieldSetting[WIDGET.ATTACHMENT].label, icon: "&#xe60a" },
  { type: WIDGET.DEPARTMENT, label: fieldSetting[WIDGET.DEPARTMENT].label, placeholder: "请选择", icon: "&#xe614" },
  { type: WIDGET.EMPLOYEE, label: fieldSetting[WIDGET.EMPLOYEE].label, placeholder: "请选择", icon: "&#xe609" },
  { type: WIDGET.FLOW_INST, label: fieldSetting[WIDGET.FLOW_INST].label, placeholder: "请选择", icon: "&#xe61a" },
  { type: WIDGET.AREA, label: fieldSetting[WIDGET.AREA].label, placeholder: "请选择", icon: "&#xe64a" },
]);
let fields = ref([
  { label: "文本", fields: fieldText },
  { label: "数值", fields: fieldNum },
  { label: "选项", fields: fieldSelect },
  { label: "日期", fields: fieldDate },
  { label: "其他", fields: fieldEtc },
]);
let widgets = ref([]);
let widget = ref({}); // 选中的组件

// 中间组件
const onWidgetClone = (widget) => {
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
const onWidgetClick = (ele) => {
  console.log(ele);
  const focusWidget = (ws) =>
    ws.forEach((i) => {
      i.focus = i.name == ele.name;
      if (i.type == WIDGET.DETAIL) focusWidget(i.details);
    });
  focusWidget(widgets.value);
  widget.value = ele;
  showSettingDetail.value = true;
};
const onWidgetDelete = (ele) => {
  let name = ele.name;
  ArrayUtil.remove(widgets.value, "name", name);
  widgets.value.forEach((i) => {
    if (i.type == WIDGET.DETAIL) ArrayUtil.remove(i.details, "name", name);
  });
  widget.value = {};
  showSettingDetail.value = false;
};
const onWidgetChange = (evt) => {
  let added = evt.added;
  if (added && added.element) {
    onWidgetClick(added.element);
  }
};

// 右侧抽屉
let showSettingDetail = ref(false);
const onSettingDetailClose = () => {
  showSettingDetail.value = false;
};
const onSettingDetailSave = () => {
  onSettingDetailClose();
};
const onAddWidgetOption = (widget) => {
  widget.options.push("");
};
const onDeleteWidgetOption = (widget, idx) => {
  widget.options.splice(idx, 1);
};
const isNotInDetailWidget = (widget) => {
  for (let i = 0; i < widgets.value.length; i++) {
    if (widgets.value[i].name == widget.name) return true;
  }
  return false;
};

// 表单校验
const validate = (widgets) => {
  console.log(widgets);
};

// 组件初始化
onMounted(() => {
  if (!!!flowDefinition.flowWidgets) {
    flowDefinition.flowWidgets = [];
  }
  widgets.value = flowDefinition.flowWidgets;

  // 初始化组件focus
  widgets.value.forEach((i) => {
    if (i.focus) onWidgetClick(i);
    if ([9].includes(i.type)) i.details.forEach((ii) => ii.focus && onWidgetClick(i));
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
