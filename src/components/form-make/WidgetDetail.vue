<template>
  <div :class="['form-item-widget-detail-box', widget.required ? 'detail-required' : '']">
    <div class="widget-detail-name">{{ widget.label }}</div>
    <draggable
      :class="['widget-detail-box', widget.details.length == 0 ? 'empty-box' : '']"
      :list="widget.details"
      v-bind="{ group: { name: 'widgets' }, animation: 200, ghostClass: 'ghost' }"
      @change="onWidgetChange($event)"
      handle=".widget-move"
      item-key="name">
      <template #item="{ element }">
        <div :class="['field-widget', element.focus ? 'field-widget-focus' : '']" @click.stop.prevent="onWidgetClick(element)">
          <template v-if="element.focus">
            <div class="widget-move"><icon-drag-arrow :size="12" /></div>
            <div class="widget-delete" @click.stop.prevent="onWidgetDelete(element)"><icon-close :size="12" /></div>
          </template>
          <template v-if="element.type == WIDGET.SINGLELINE_TEXT">
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
                <a-select :placeholder="element.placeholder" disabled></a-select>
              </div>
            </div>
          </template>
          <template v-else-if="element.type == WIDGET.MULTI_CHOICE">
            <div :class="['form-item', element.required ? 'required' : '']">
              <div class="form-item-name">{{ element.label }}</div>
              <div class="form-item-widget">
                <a-select :multiple="true" :placeholder="element.placeholder" disabled></a-select>
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
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import draggable from "vuedraggable";
import ArrayUtil from "@/components/flow/common/ArrayUtil";
import { Notification } from "@arco-design/web-vue";
import { IconDragArrow, IconClose, IconPlus } from "@arco-design/web-vue/es/icon";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import CHINA_AREA from "@/components/flow/common/ChinaArea";

const props = defineProps({
  widget: { type: Object, required: true },
});

let emits = defineEmits(["click", "delete", "change"]);
const onWidgetClick = (ele) => {
  emits("click", ele);
};
const onWidgetDelete = (ele) => {
  emits("delete", ele);
};
const onWidgetChange = (evt) => {
  // 明细不能套明细
  if (props.widget.type == WIDGET.DETAIL) {
    let added = evt.added;
    if (added && added.element && added.element.type == WIDGET.DETAIL) {
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
