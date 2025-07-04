<template>
  <section class="flow-edit-box" v-loading.fullscreen="launching">
    <div class="fd-nav">
      <div class="fd-nav-left">
        <div class="back" @click="back()"><icon-left :size="16" /></div>
        <div class="name-desc" v-if="flowDefinition.workFlowDef">
          <div class="name">{{ flowDefinition.workFlowDef.name }}</div>
          <div class="desc">{{ flowDefinition.workFlowDef.remark }}</div>
        </div>
      </div>
      <div class="fd-nav-mid">
        <div class="steps">
          <a-steps changeable :current="step" @change="hanldeStepClick">
            <a-step>基础信息 <template #icon>1</template></a-step>
            <a-step>表单设计 <template #icon>2</template></a-step>
            <a-step>流程设计 <template #icon>3</template></a-step>
            <a-step>更多设置 <template #icon>4</template></a-step>
          </a-steps>
        </div>
      </div>
      <div class="fd-nav-right">
        <a-button @click="deploy()" :disabled="launching">发 布</a-button>
      </div>
    </div>

    <div class="flow-edit-box">
      <div class="fd-main">
        <transition name="fade-transform" mode="out-in">
          <template v-if="step == 1" :key="1"> <Base ref="baseBox"></Base> </template>
          <template v-else-if="step == 2" :key="2"> <FormMake ref="formMakeBox"></FormMake> </template>
          <template v-else-if="step == 3" :key="3">
            <div class="fd-main-box" v-dragscroll><Flow ref="flowBox"></Flow></div>
          </template>
          <template v-else-if="step == 4" :key="4"> <Setting ref="settingBox"></Setting> </template>
        </transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import FlowManApi from "@/api/FlowManApi";
import { WIDGET } from "@/components/flow/common/FlowConstant";
import { initWidgetFormula } from "@/components/flow/common/FlowFormula";
import { filterConditionWidgets, resetAllNodeFormAuth } from "@/components/flow/common/FormAuth";
import { cleanUnrequiredWidget, initBranchExp } from "@/components/flow/common/FormExp";
import Flow from "@/components/flow/index.vue";
import FormMake from "@/components/form-make/index.vue";
import { useFlowStore } from "@/stores/index";
import { Notification } from "@arco-design/web-vue";
import { IconLeft } from "@arco-design/web-vue/es/icon";
import { onBeforeMount, ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import Base from "./base.vue";
import FlowValidate from "./flow-validate";
import Setting from "./setting.vue";

let { flowDefinition } = useFlowStore();
const router = useRouter();

let launching = ref(false); // 流程发布中
let baseBox = ref(); // 基本信息组件
let formMakeBox = ref(); // 表单设计组件
let flowBox = ref(); // 流程组件
let settingBox = ref(); // 更多设置组件
let step = ref(1);
const hanldeStepClick = (nStep) => {
  if (step.value == 1) {
    baseBox.value.validate();
  } else if (step.value == 2) {
    let { nodeConfig, flowWidgets } = flowDefinition;
    cleanUnrequiredWidget(flowWidgets, nodeConfig);
    let ok = formMakeBox.value.validate();
    if (!ok) return;
  }
  step.value = nStep;
};

const back = () => {
  router.push("/flowmanindex");
};

const validate = (flowDef) => {
  let errs = [];
  let { workFlowDef, flowWidgets, nodeConfig, flowPermission } = flowDef;

  // 流程定义检查是否合法
  errs.push(...FlowValidate.verifyBaseInfo(workFlowDef));
  errs.push(...FlowValidate.verifyFormInfo(flowWidgets));
  errs.push(...FlowValidate.verifyFlowInfo(nodeConfig, flowPermission));

  // 基本信息组件内部校验
  baseBox.value && baseBox.value.validate();

  if (errs.length > 0) {
    for (let i = 0; i < errs.length; i++) {
      setTimeout(() => Notification.error(errs[i]), i * 50);
    }
    return false;
  }

  // 清除focus
  flowWidgets.forEach((widget) => {
    delete widget.focus;
    if ([WIDGET.DETAIL].includes(widget.type)) widget.details.forEach((i) => delete i.focus);
  });
  return true;
};

const initNodeConfig = (flowDef) => {
  let { flowWidgets, nodeConfig } = flowDef;
  // 初始化分支表达式
  initBranchExp(nodeConfig);

  // 重新设置一下节点表单权限
  let conditionWidgets = [];
  filterConditionWidgets(nodeConfig, conditionWidgets);
  resetAllNodeFormAuth(nodeConfig, flowWidgets, conditionWidgets);
  // 组件重新生成一下计算表达式
  initWidgetFormula(flowWidgets);
};

const deploy = () => {
  launching.value = true;
  let flowDef = JSON.parse(JSON.stringify(toRaw(flowDefinition)));
  if (validate(flowDef)) {
    initNodeConfig(flowDef);
    console.log("发布审批", flowDef);
    FlowManApi.saveOrUpdate({ ...flowDef, flowDefJson: JSON.stringify(flowDef) }).then(
      (resp) => {
        launching.value = false;
        if (resp.code == 1) {
          Notification.success(`流程${flowDefinition.workFlowDef.name}发布成功！`);
          router.push("/flowmanindex");
        }
      },
      () => (launching.value = false)
    );
  } else {
    launching.value = false;
  }
};

onBeforeMount(async () => {
  if (flowDefinition.workFlowDef == undefined) {
    router.push("/flowmanindex");
  }
});
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

@header-height: 70px;
@canvas-bg: @MainContentBg;

.fd-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  width: 100%;
  height: @header-height;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.04);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  user-select: none;

  .fd-nav-left {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;

    .back {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-2);
      background-color: var(--color-secondary);
      font-size: 14px;
      border-radius: var(--border-radius-small);

      &:hover {
        background-color: var(--color-secondary-hover);
      }
    }

    .name-desc {
      display: flex;
      flex-direction: column;
      max-width: 200px;
      margin-left: 15px;

      .name {
        font-size: 16px;
        height: 24px;
        line-height: 24px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .desc {
        line-height: 20px;
        font-size: 12px;
        color: #8f959e;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .fd-nav-mid {
    flex: 2;
  }

  .fd-nav-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.fd-main {
  position: fixed;
  top: @header-height;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(100% - @header-height);
  background-color: @canvas-bg;
  overflow: hidden;

  .fd-main-box {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
