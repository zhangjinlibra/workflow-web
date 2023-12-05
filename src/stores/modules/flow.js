import { defineStore } from "pinia";

const useFlowStore = defineStore("flow", {
  state: () => ({
    flowDefinition: {}, // 流程定义
    flowDefId: null, // 流程定义id

    // 设置发起人
    isPromoterDrawerOpened: false,
    promoterConfig0: {},
    // 设置审批人
    isApproverDrawerOpened: false,
    approverConfig0: {},
    // 设置抄送人
    isCopyerDrawerOpened: false,
    copyerConfig0: {},
    // 设置条件
    isConditionDrawerOpened: false,
    conditionsConfig0: { conditionNodes: [] },
    // 设置办理人
    isTransactorDrawerOpened: false,
    transactorConfig0: {},

    // 流程分组
    flowGroups: [],
  }),
  actions: {
    setFlowDef(flowDefinition) {
      console.log("流程设置", flowDefinition);
      this.flowDefinition = flowDefinition;
    },
    getFlowDef() {
      return JSON.parse(JSON.stringify(this.flowDefinition));
    },

    setFlowDefId(flowDefId) {
      this.flowDefId = flowDefId;
    },

    showPromoterDrawer(isOpened) {
      this.isPromoterDrawerOpened = isOpened;
    },
    setPromoterConfig(promoterConfig) {
      this.promoterConfig0 = promoterConfig;
    },

    showApproverDrawer(isOpened) {
      this.isApproverDrawerOpened = isOpened;
    },
    setApproverConfig(approverConfig) {
      this.approverConfig0 = approverConfig;
    },

    showCopyerDrawer(isOpened) {
      this.isCopyerDrawerOpened = isOpened;
    },
    setCopyerConfig(copyerConfig) {
      this.copyerConfig0 = copyerConfig;
    },

    showConditionDrawer(isOpened) {
      this.isConditionDrawerOpened = isOpened;
    },
    setConditionsConfig(conditionsConfig) {
      this.conditionsConfig0 = conditionsConfig;
    },

    showTransactorDrawer(isOpened) {
      this.isTransactorDrawerOpened = isOpened;
    },
    setTransactorConfig(transactorConfig) {
      this.transactorConfig0 = transactorConfig;
    },

    setFlowGroups(flowGroups) {
      this.flowGroups = flowGroups;
    },
  },
});

export default useFlowStore;
