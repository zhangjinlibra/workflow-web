<template>
  <a-drawer
    v-if="visible"
    :append-to-body="true"
    :width="540"
    :visible="visible"
    :closable="false"
    @ok="saveCondition()"
    @cancel="onClose()"
    ok-text="保存">
    <template #title>
      <EditableText :value="flowNodeConfig.name" @change="onNodeNameChange" />
    </template>

    <div class="top-tips">满足以下条件时进入当前分支</div>

    <!-- 单个条件组编辑器 -->
    <template v-for="(conditionGroup, conditionGroupIdx) in flowNodeConfig.conditionGroups">
      <div class="or-branch-link-tip" v-if="conditionGroupIdx != 0">或满足</div>
      <div class="condition-group-editor">
        <div class="header">
          <span>条件组 {{ conditionGroupIdx + 1 }}</span>
          <icon-delete class="branch-delete-icon" @click="rmConditionGroup(conditionGroup)" />
        </div>

        <div class="main-content">
          <!-- 单个条件 -->
          <div class="condition-item" v-for="(condition, idx) in conditionGroup.conditions">
            <div class="condition-relation">
              <span>{{ idx == 0 ? "当" : "且" }}</span>
              <icon-delete class="branch-delete-icon" @click="rmCondition(conditionGroup, condition)" />
            </div>
            <div class="condition-key">
              <a-select v-model="condition.varName" @change="onConditionChange($event, condition)">
                <a-option v-for="opt in conditionOptions" :value="opt.name">{{ opt.label }}</a-option>
              </a-select>
            </div>
            <div class="condition-content">
              <div class="compare-select">
                <a-select v-model="condition.operator">
                  <a-option :value="funIdx" v-for="funIdx in condition.operators">{{ FunNames[funIdx] }}</a-option>
                </a-select>
              </div>
              <!-- 发起人条件 -->
              <template v-if="condition.varName == INITIATOR_VAR_NAME">
                <div class="value-select">
                  <div class="content" placeholder="选择">
                    <template v-if="ArrayUtil.isArray(condition.val)">
                      <div class="item-tag" v-for="i in condition.val">{{ getById(i).name }}</div>
                    </template>
                  </div>
                  <div class="btn" @click="onOpenOrganChooseBox(condition)">
                    <a-link>添加</a-link>
                  </div>
                </div>
              </template>
              <!-- 表单组件条件 -->
              <template v-else>
                <div class="val-content">
                  <div v-if="getWidget(condition.varName).type == WIDGET.SINGLELINE_TEXT">
                    <a-input v-model:model-value="condition.val" :max-length="64" allow-clear />
                  </div>
                  <div v-else-if="[WIDGET.NUMBER, WIDGET.DETAIL, WIDGET.FORMULA].includes(getWidget(condition.varName).type)">
                    <a-input-number
                      v-model="condition.val"
                      :max-length="15"
                      :formatter="(v) => ObjectUtil.limitScale(v, 2)"
                      :hide-button="true" />
                  </div>
                  <div v-else-if="[WIDGET.MONEY].includes(getWidget(condition.varName).type)">
                    <a-input-number v-model="condition.val" :max-length="15" :formatter="(v) => ObjectUtil.limitScale(v, 2)" :hide-button="true">
                      <template #suffix>元</template>
                    </a-input-number>
                  </div>
                  <div v-else-if="[WIDGET.DATE_RANGE].includes(getWidget(condition.varName).type)">
                    <a-input-number v-model="condition.val" :max-length="8" :formatter="(v) => ObjectUtil.limitScale(v, 1)" :hide-button="true">
                      <template #suffix>天</template>
                    </a-input-number>
                  </div>
                  <div v-else-if="getWidget(condition.varName).type == WIDGET.SINGLE_CHOICE">
                    <a-select v-model:model-value="condition.val" allow-search>
                      <a-option :value="option" v-for="option in getWidget(condition.varName).options">{{ option }}</a-option>
                    </a-select>
                  </div>
                  <div v-else-if="getWidget(condition.varName).type == WIDGET.MULTI_CHOICE">
                    <a-select multiple v-model:model-value="condition.val" allow-search>
                      <a-option :value="option" v-for="option in getWidget(condition.varName).options">{{ option }}</a-option>
                    </a-select>
                  </div>
                  <div v-else-if="getWidget(condition.varName).type == WIDGET.DATE">
                    <a-date-picker :style="{ width: '100%' }" v-model="condition.val" />
                  </div>
                  <div v-else-if="getWidget(condition.varName).type == WIDGET.DEPARTMENT">
                    <a-select v-model:model-value="condition.val" allow-search multiple>
                      <a-option :value="dept.id" v-for="dept in allDepts">{{ dept.name }}</a-option>
                    </a-select>
                  </div>
                  <div v-else-if="getWidget(condition.varName).type == WIDGET.EMPLOYEE">
                    <a-select v-model:model-value="condition.val" allow-search multiple>
                      <a-option :value="user.id" v-for="user in allUsers">{{ user.name }}</a-option>
                    </a-select>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="sub-content">
          <a-link @click="addCondition(conditionGroup)">
            <template #icon><icon-plus /></template>添加条件
          </a-link>
        </div>
      </div>
    </template>

    <section class="operate">
      <a-button long @click="addConditionGroup">
        添加条件组
        <template #icon><icon-plus /></template>
      </a-button>
    </section>
    <!-- 发起人选项 -->
    <OrganChooseBox v-model:visible="showOrganChooseBox" v-model:selected="selectedOrgan" />
  </a-drawer>
</template>

<script setup>
import EditableText from "@/components/common/EditableText.vue";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { useFlowStore, useOrganStore } from "@/stores/index";
import { IconDelete, IconPlus } from "@arco-design/web-vue/es/icon";
import { computed, ref, toRaw, watch } from "vue";
import ArrayUtil from "../common/ArrayUtil";
import { names as FunNames, INITIATOR_VAR_NAME } from "../common/FormExp";
import ObjectUtil from "../common/ObjectUtil";
import Snowflake from "../common/Snowflake";
import OrganChooseBox from "../dialog/OrganChooseBox.vue";

let flowStore = useFlowStore();
let { getById, users: allUsers, depts: allDepts } = useOrganStore();
let { showConditionDrawer, setConditionsConfig, flowDefinition } = flowStore;
let conditionsConfig0 = computed(() => flowStore.conditionsConfig0);
let visible = ref(false); // 是否显示

// 所有的条件选项，该处值是表单编辑器传递过来的
let conditionOptions = ref([]);
let _uid = ref(0);
let priorityLevel = 0; // 当前分支条件优先级
let gatewayConfig = ref({}); // 排他网关
let flowNodeConfig = ref({}); // 当前分支节点
let selectedGroupCondition = ref({}); // 当前选中的分组条件

let showOrganChooseBox = ref(false); // 是否显示organ对话框
let selectedOrgan = ref([]); // 对话框选中的组织人员
const onOpenOrganChooseBox = (condition) => {
  showOrganChooseBox.value = true;
  selectedOrgan.value = condition.val || [];
  selectedGroupCondition.value = condition;
};
watch(selectedOrgan, () => {
  selectedGroupCondition.value.val = selectedOrgan.value;
});

// 侧边栏是否打开
watch(
  () => flowStore.isConditionDrawerOpened,
  (isOpen) => {
    visible.value = isOpen;
    if (isOpen) initCondition();
  }
);

// 侧边栏打开初始化
const initCondition = () => {
  let val = conditionsConfig0.value;
  _uid = val.id;
  priorityLevel = val.priorityLevel;
  gatewayConfig.value = val.value;
  flowNodeConfig.value = gatewayConfig.value.conditionNodes[priorityLevel - 1];

  // 初始化分组条件选项
  conditionOptions.value = [{ name: INITIATOR_VAR_NAME, label: "发起人", operators: [20, 21] }];

  // 将表单必填项转换为分支条件
  let widgets = ObjectUtil.copy(flowDefinition.flowWidgets || []);
  if (widgets && widgets.length) {
    widgets.forEach((widget) => {
      let { name, type, required, label, formulaItems, details } = widget;
      // 非明细组件
      if (required) {
        if ([WIDGET.SINGLELINE_TEXT].includes(type)) {
          widget.operators = [14, 15, 10, 11, 12, 13];
        } else if ([WIDGET.NUMBER, WIDGET.MONEY, WIDGET.DATE_RANGE].includes(type)) {
          widget.operators = [0, 1, 2, 3, 4, 5];
        } else if ([WIDGET.SINGLE_CHOICE].includes(type)) {
          widget.operators = [12, 13];
          widget.options = widget.options.filter((item) => !!item); // 过滤掉为空的选项
        } else if ([WIDGET.MULTI_CHOICE].includes(type)) {
          widget.operators = [20, 21];
          widget.options = widget.options.filter((item) => !!item);
        } else if ([WIDGET.DATE].includes(type)) widget.operators = [12, 13];
        else if ([WIDGET.DEPARTMENT, WIDGET.EMPLOYEE].includes(type)) {
          widget.operators = [20, 21];
        }

        // 加入条件列表
        if (widget.operators) {
          conditionOptions.value.push(widget);
        }
      }

      // 计算公式组件
      if (type == WIDGET.FORMULA) {
        widget.operators = [0, 1, 2, 3, 4, 5];
        conditionOptions.value.push(widget);
      }

      // 明细组件
      if (type == WIDGET.DETAIL && formulaItems && formulaItems.length && details && details.length) {
        conditionOptions.value.push({
          name,
          type,
          label: label,
          operators: [0, 1, 2, 3, 4, 5],
        });
        // // TODO 明细组件作为分支条件
        // details.forEach((detail) => {
        //   let { type: detailType, required: detailRequired } = detail;
        //   if (detailRequired && [WIDGET.NUMBER, WIDGET.MONEY].includes(detailType)) {
        //     detail.operators = [0, 1, 2, 3, 4, 5];
        //     detail.label = detail.label + "（合计）";
        //     conditionOptions.value.push(detail);
        //   }
        // });
      }
    });
  }

  // conditionOptions.value = [
  //   { name: INITIATOR_VAR_NAME, label: "发起人", operators: [20, 21] },
  //   ...toRaw(flowDefinition.flowWidgets || []).filter((widget) => {
  //     let { type, required } = widget;
  //     if ([WIDGET.SINGLELINE_TEXT].includes(type)) widget.operators = [10, 11, 12, 13];
  //     else if ([WIDGET.NUMBER, WIDGET.MONEY, WIDGET.DATE_RANGE].includes(type)) widget.operators = [0, 1, 2, 3, 4, 5];
  //     else if ([WIDGET.SINGLE_CHOICE].includes(type)) widget.operators = [12, 13];
  //     else if ([WIDGET.MULTI_CHOICE].includes(type)) widget.operators = [20, 21];
  //     else if ([WIDGET.DATE].includes(type)) widget.operators = [12, 13];
  //     console.log("组件", widget.label, widget.name);
  //     return required && widget.operators;
  //   }),
  // ];
};

// 条件选项切换
const onConditionChange = (optionName, condition) => {
  // 当前选择的条件
  selectedGroupCondition.value = condition;
  let option = ArrayUtil.get(conditionOptions.value, "name", optionName);
  // 清除选中的操作
  condition.operator = null;
  // 清除条件值
  condition.val = null;
  // 设置操作符选项
  if (option) condition.operators = option.operators || [];
};
// 根据组件名称获取组件
const getWidget = (name) => {
  return ArrayUtil.get(conditionOptions.value, "name", name) || {};
};

// 条件组相关操作
const addConditionGroup = () => {
  let { conditionGroups } = flowNodeConfig.value;
  if (!conditionGroups) flowNodeConfig.value.conditionGroups = conditionGroups = [];
  conditionGroups.push({ id: Snowflake.generate(), conditions: [{ id: Snowflake.generate() }] });
};
const rmConditionGroup = (conditionGroup) => {
  ArrayUtil.remove(flowNodeConfig.value.conditionGroups, "id", conditionGroup.id);
};
const addCondition = (conditionGroup) => {
  conditionGroup.conditions.push({ id: Snowflake.generate() });
};
const rmCondition = (conditionGroup, condition) => {
  ArrayUtil.remove(conditionGroup.conditions, "id", condition.id);
};

// 编辑节点名称
const onNodeNameChange = (name) => {
  flowNodeConfig.value.name = name;
  saveCondition(false);
};

const saveCondition = (leave = true) => {
  // 组装成表达式
  // initExp(flowNodeConfig.value);// 改成点击发布是生成表达式
  // 保存分支条件
  gatewayConfig.value.conditionNodes[priorityLevel - 1] = flowNodeConfig.value;
  setConditionsConfig({
    value: toRaw(gatewayConfig.value),
    priorityLevel,
    flag: true,
    id: _uid,
  });
  leave && showConditionDrawer(false);
};

const onClose = () => {
  saveCondition();
};
</script>

<style lang="less">
.top-tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #646a73;
}

.or-branch-link-tip {
  margin: 10px 0;
  color: #646a73;
}

.condition-group-editor {
  user-select: none;
  border-radius: 4px;
  border: 1px solid #e4e5e7;
  position: relative;

  .branch-delete-icon {
    font-size: 18px;
  }

  .arco-icon {
    cursor: pointer;
    &:hover {
      color: #3370ff;
    }
  }

  + .condition-group-editor {
    margin-top: 8px;
  }

  .header {
    background-color: #f4f6f8;
    padding: 0 12px;
    font-size: 14px;
    color: #171e31;
    height: 36px;
    display: flex;
    align-items: center;

    span {
      flex: 1;
    }
  }

  .main-content {
    padding: 0 12px;

    .condition-relation {
      color: #9ca2a9;
      display: flex;
      align-items: center;
      height: 36px;
      display: flex;
      justify-content: space-between;
      padding: 0 2px;
    }

    .val-content {
      margin-top: 8px;
    }

    .condition-content {
      margin-top: 8px;

      .value-select {
        margin-top: 8px;
        display: flex;
        box-sizing: border-box;
        width: 100%;
        padding: 0 8px 0 12px;
        color: var(--color-text-1);
        font-size: 14px;
        background-color: var(--color-fill-2);
        border: 1px solid transparent;
        border-radius: var(--border-radius-small);

        &:hover {
          background-color: var(--color-fill-3);
          border-color: transparent;
        }

        .content {
          flex: 1;
          padding: 0 0 4px 0;
          display: flex;
          align-items: center;
          min-height: 31.6px;
          flex-wrap: wrap;

          .item-tag {
            background-color: #f9f9f9;
            font-size: 12px;
            cursor: pointer;
            padding: 2px 4px;
            border-radius: var(--border-radius-small);
            margin: 4px 4px 0 0;

            &:hover {
              background-color: #fff;
            }
          }
        }

        .btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }

  .sub-content {
    padding: 12px;
  }
}

.operate {
  margin-top: 12px;
}
</style>
