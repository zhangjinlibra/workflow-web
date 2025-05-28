<template>
  <div :class="['form-item-widget-detail-box', widget.required ? 'detail-required' : '']">
    <div class="widget-detail-name">{{ widget.label }}</div>
    <draggable
      :class="['widget-detail-box', widget.details.length == 0 ? 'empty-box' : '']"
      :list="widget.details"
      v-bind="{ group: { name: 'widgets' }, animation: 200, ghostClass: 'ghost' }"
      @change="handleWidgetChange($event)"
      handle=".widget-move"
      item-key="name">
      <template #item="{ element }">
        <div
          :class="[
            'field-widget',
            element.focus ? 'field-widget-focus' : '',
            formulaErrorWidgetNames.includes(element.name) ? 'field-widget-error' : '',
          ]"
          @click.stop.prevent="handleWidgetClick(element)">
          <template v-if="element.focus">
            <div class="widget-move"><icon-drag-arrow :size="12" /></div>
            <div class="widget-delete" @click.stop.prevent="handleWidgetDelete(element)"><icon-close :size="12" /></div>
          </template>
          <template
            v-if="[WIDGET.SINGLELINE_TEXT, WIDGET.MAILBOX, WIDGET.MOBILE, WIDGET.IDCARD, WIDGET.WEBSITE, WIDGET.FORMULA].includes(element.type)">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-input :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.MULTILINE_TEXT">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-textarea :placeholder="element.placeholder" disabled />
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
                <a-input-number :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.MONEY">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-input-number :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.SINGLE_CHOICE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-select :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.MULTI_CHOICE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-select :multiple="true" :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.DATE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-date-picker :placeholder="element.placeholder" disabled :style="{ width: '100%' }" />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.DATE_RANGE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-range-picker :placeholder="[element.placeholder, element.placeholder]" disabled />
              </div>
            </div>
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
                <a-select :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.EMPLOYEE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-select :placeholder="element.placeholder" disabled />
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.AREA">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-cascader :options="CHINA_AREA" :placeholder="element.placeholder" disabled />
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
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import CHINA_AREA from "@/components/flow/common/ChinaArea";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { Notification } from "@arco-design/web-vue";
import { IconClose, IconDragArrow, IconPlus } from "@arco-design/web-vue/es/icon";
import draggable from "vuedraggable";

const props = defineProps({
  widget: { type: Object, required: true },
  formulaErrorWidgetNames: { type: Array, default: () => [] },
});

// 非明细控件
const nonDetailWidgets = [WIDGET.DETAIL, WIDGET.RICH_TEXT];

let emits = defineEmits(["click", "delete", "change"]);
const handleWidgetClick = (ele) => {
  emits("click", ele);
};
const handleWidgetDelete = (ele) => {
  emits("delete", ele);
};
const handleWidgetChange = (evt) => {
  // 明细不能套明细
  if (props.widget.type == WIDGET.DETAIL) {
    let added = evt.added;
    if (added && added.element && nonDetailWidgets.includes(added.element.type)) {
      ArrayUtil.remove(props.widget.details, "name", added.element.name);
      Notification.warning("暂不支持该控件添加到明细");
      evt = null;
    }
  }
  if (evt) emits("change", evt);
};
</script>

<style lang="less" scoped>
@import "./form-make.less";
</style>
