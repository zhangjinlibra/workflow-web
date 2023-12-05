<!-- 节点表单权限设置 -->
<template>
  <div class="item-form-auth">
    <table cellpadding="0" cellspacing="0">
      <colgroup>
        <col width="80" />
        <col width="100" />
        <col width="100" v-if="readable" />
        <col width="100" v-if="editable" />
      </colgroup>
      <thead>
        <tr>
          <th colspan="2">表单字段</th>
          <th v-if="readable">
            <a-checkbox :model-value="checkedAllReadable" :indeterminate="checkedAllReadableIndeterminate" @change="handleChangeAllReadable">
              可读
            </a-checkbox>
          </th>
          <th v-if="editable">
            <a-checkbox :model-value="checkedAllEditable" :indeterminate="checkedAllEditableIndeterminate" @change="handleChangeAllEditable">
              编辑
            </a-checkbox>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="widget in formAuths">
          <tr v-if="WIDGET.DETAIL != widget.type">
            <td colspan="2">{{ widget.label }}</td>
            <td v-if="readable">
              <a-checkbox :model-value="widget.readable" @change="handleReadableChange($event, widget)" />
            </td>
            <td v-if="editable">
              <a-checkbox
                :model-value="widget.editable"
                :disabled="conditionWidgets.includes(widget.name)"
                @change="handleEditableChange($event, widget)" />
            </td>
          </tr>
          <template v-else>
            <tr v-for="(detail, idx) in widget.details">
              <td v-if="idx == 0" :rowspan="widget.details.length">{{ widget.label }}</td>
              <td>{{ detail.label }}</td>
              <td v-if="readable">
                <a-checkbox :model-value="detail.readable" @change="handleReadableChange($event, detail, widget)" />
              </td>
              <td v-if="editable">
                <a-checkbox
                  :model-value="detail.editable"
                  :disabled="conditionWidgets.includes(detail.name)"
                  @change="handleEditableChange($event, detail, widget)" />
              </td>
            </tr>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { useFlowStore } from "@/stores/index";
import { onMounted, ref, toRaw } from "vue";
import ArrayUtil from "./common/ArrayUtil";
import { filterConditionWidgets, initNodeFormAuth } from "./common/FormAuth";
import ObjectUtil from "./common/ObjectUtil";

let flowStore = useFlowStore();
let { flowDefinition } = flowStore;

const props = defineProps({
  flowNodeConfig: { type: Object },
  editable: { type: Boolean, default: true },
  readable: { type: Boolean, default: false },
});

// 所有作为条件的组件, 作为条件的组件不能被编辑
const conditionWidgets = ref([]);

// 节点表单权限
const formAuths = ref([]); // 表单组件
const checkedAllReadable = ref(true);
const checkedAllEditable = ref(false);
const checkedAllReadableIndeterminate = ref(false);
const checkedAllEditableIndeterminate = ref(false);
const handleChangeAllReadable = (checked) => {
  checkedAllReadable.value = checked;
  checkedAllReadableIndeterminate.value = false;
  if (!checked) {
    checkedAllEditable.value = checked;
    checkedAllEditableIndeterminate.value = false;
  }
  formAuths.value.forEach((widget) => {
    if (widget.type !== WIDGET.DETAIL) {
      widget.readable = checked;
      if (!checked) widget.editable = checked;
    } else
      widget.details.forEach((detail) => {
        detail.readable = checked;
        if (!checked) detail.editable = checked;
      });
  });
};
const handleChangeAllEditable = (checked) => {
  checkedAllEditable.value = checked;
  checkedAllEditableIndeterminate.value = checked && conditionWidgets.value.length > 0 ? checked : false;
  if (checked) {
    checkedAllReadable.value = checked;
    checkedAllReadableIndeterminate.value = false;
  }
  formAuths.value.forEach((widget) => {
    if (widget.type !== WIDGET.DETAIL) {
      if (!conditionWidgets.value.includes(widget.name)) widget.editable = checked;
      if (checked) widget.readable = checked;
    } else
      widget.details.forEach((detail) => {
        if (!conditionWidgets.value.includes(detail.name)) detail.editable = checked;
        if (checked) detail.readable = checked;
      });
  });
};

const banXuan = () => {
  let total = 0;
  let readableChecked = 0;
  let editableChecked = 0;
  formAuths.value.forEach((widget) => {
    if (widget.type !== WIDGET.DETAIL) {
      total++;
      if (widget.readable) readableChecked++;
      if (widget.editable) editableChecked++;
    } else
      widget.details.forEach((detail) => {
        total++;
        if (detail.readable) readableChecked++;
        if (detail.editable) editableChecked++;
      });
  });
  if (readableChecked == 0) {
    checkedAllReadable.value = false;
    checkedAllReadableIndeterminate.value = false;
  } else if (readableChecked == total) {
    checkedAllReadable.value = true;
    checkedAllReadableIndeterminate.value = false;
  } else {
    checkedAllReadable.value = false;
    checkedAllReadableIndeterminate.value = true;
  }

  if (editableChecked == 0) {
    checkedAllEditable.value = false;
    checkedAllEditableIndeterminate.value = false;
  } else if (editableChecked == total) {
    checkedAllEditable.value = true;
    checkedAllEditableIndeterminate.value = false;
  } else {
    checkedAllEditable.value = editableChecked + conditionWidgets.value.length == total;
    checkedAllEditableIndeterminate.value = true;
  }
};
const handleReadableChange = (checked, widget, parent) => {
  widget.readable = checked;
  if (!checked) widget.editable = checked;
  banXuan();
};
const handleEditableChange = (checked, widget, parent) => {
  widget.editable = checked;
  if (checked) widget.readable = checked;
  banXuan();
};

onMounted(() => {
  filterConditionWidgets(flowDefinition.nodeConfig, conditionWidgets.value);
  conditionWidgets.value = ArrayUtil.unique(conditionWidgets.value);
  let widgets = ObjectUtil.copy(toRaw(flowDefinition.flowWidgets || []));
  initNodeFormAuth(props.flowNodeConfig, widgets, conditionWidgets.value);
  formAuths.value = props.flowNodeConfig.formAuths;
  banXuan();
});
</script>

<style lang="less" scoped>
@BorderColor: #e4e5e7;
@FontSize: 13px;

.item-form-auth {
  margin-top: 8px;
  font-size: @FontSize;
  border-radius: 6px;
  overflow: hidden;

  table {
    width: 100%;
    border: 1px solid @BorderColor;
    border-radius: 6px;

    td,
    th {
      height: 36px;
      text-align: left;
      padding: 0 12px;
    }

    thead {
      background: #f5f6f7;
    }

    tbody {
      td {
        border-top: 1px solid @BorderColor;
      }

      tr:first-child {
        td {
          border-top: 0;
        }
      }
    }
  }

  .arco-checkbox {
    font-size: @FontSize;
  }
}
</style>
