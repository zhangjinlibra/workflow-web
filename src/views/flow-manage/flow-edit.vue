<template>
  <section class="flow-edit-box">
    <div class="fd-nav">
      <div class="fd-nav-left">
        <div class="back" @click="back()"><icon-left :size="24" /></div>
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
          <template v-else-if="step == 2" :key="2"> <FormMake></FormMake> </template>
          <template v-else-if="step == 3" :key="3">
            <div class="fd-main-box" v-dragscroll><Flow ref="flowBox"></Flow></div>
          </template>
          <template v-else-if="step == 4" :key="4"> <Setting></Setting> </template>
        </transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeMount, ref, toRaw, watch, onMounted } from "vue";
import { useFlowStore } from "@/stores/index";
import { useRouter } from "vue-router";
import { Notification } from "@arco-design/web-vue";
import Base from "./base.vue";
import FormMake from "@/components/form-make/index.vue";
import Flow from "@/components/flow/index.vue";
import Setting from "./setting.vue";
import FlowManApi from "@/api/FlowManApi";
import FlowValidate from "./flow-validate";
import { cleanUnrequiredWidget, initBranchExp } from "@/components/flow/common/FormExp";
import { IconLeft } from "@arco-design/web-vue/es/icon";

let { flowDefinition } = useFlowStore();
const router = useRouter();

let loading = ref(false);
let launching = ref(false); // 流程发布中
let baseBox = ref();
let flowBox = ref();
let step = ref(1);
const hanldeStepClick = (nStep) => {
  if (step.value == 1) {
    baseBox.value.validate();
  } else if (step.value == 2) {
    let { nodeConfig, flowWidgets } = flowDefinition;
    cleanUnrequiredWidget(flowWidgets, nodeConfig);
  }
  step.value = nStep;
};

const back = () => {
  router.push("/flowmanindex");
};

const validate = (flowDef) => {
  let errs = [];
  errs.push(...FlowValidate.validateFlowBaseInfo(flowDef.workFlowDef));
  errs.push(...FlowValidate.validateFlowWidgets(flowDef.flowWidgets));
  errs.push(...FlowValidate.validateFlowNode(flowDef.nodeConfig));

  // 当前组件校验
  baseBox.value && baseBox.value.validate();

  if (errs.length > 0) {
    for (let i = 0; i < errs.length; i++) {
      setTimeout(() => Notification.error(errs[i]), i * 50);
    }
    return false;
  }

  // 清除focus
  let flowWidgets = flowDef.flowWidgets;
  flowWidgets.forEach((widget) => {
    delete widget.focus;
    if ([9].includes(widget.type)) widget.details.forEach((i) => delete i.focus);
  });
  return true;
};

const deploy = () => {
  launching.value = true;
  let flowDef = JSON.parse(JSON.stringify(toRaw(flowDefinition)));
  console.log("流程定义", JSON.stringify(flowDef));
  if (validate(flowDef)) {
    initBranchExp(flowDef.nodeConfig);
    loading.value = true;
    FlowManApi.saveOrUpdate({ ...flowDef, flowDefJson: JSON.stringify(flowDef) }).then(
      (resp) => {
        if (resp.code == 1) {
          Notification.success(`流程${flowDefinition.workFlowDef.name}发布成功`);
          router.push("/flowmanindex");
        }
        loading.value = false;
      },
      () => (launching.value = false)
    );
  } else {
    launching.value = false;
  }
};

watch(flowDefinition, () => {
  console.log("flow changed", flowDefinition);
});

onBeforeMount(async () => {
  if (flowDefinition.workFlowDef == undefined) {
    router.push("/flowmanindex");
  }
});
</script>

<style lang="less" scoped>
@header-height: 70px;
// @canvas-bg: #f5f5f7;
@canvas-bg: #f2f3f5;

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
      margin-right: 10px;
      cursor: pointer;
      transition: 0.3s;

      &:hover {
        background: #f2f3f5;
        border-radius: 2px;
      }
    }

    .name-desc {
      display: flex;
      flex-direction: column;
      max-width: 200px;

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
