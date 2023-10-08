// 流程常量

// 流程节点
export const NODE = {
  START: 0, //"开始"
  APPROVE: 1, //"审核"
  COPY: 2, //"抄送"
  CONDITION: 3, //"条件"
  EXCLUSIVE_GATEWANY: 4, //"排他网关"
  TRANSACT: 5, //"办理"
  TRIGGER: 6, //"触发器"
  END: 9, //"结束"
};

// 流程组件
export const WIDGET = {
  SINGLELINE_TEXT: 0, //"单行文本"
  MULTILINE_TEXT: 1, //"多行文本"
  DESCRIBE: 2, //"提示文字"
  NUMBER: 3, //"数字"
  MONEY: 4, //"金额"
  SINGLE_CHOICE: 5, //"单选"
  MULTI_CHOICE: 6, //"多选"
  DATE: 7, //"日期"
  DATE_RANGE: 8, //"日期区间"
  DETAIL: 9, //"明细"
  PICTURE: 10, //"图片"
  ATTACHMENT: 11, //"附件"
  DEPARTMENT: 12, //"部门"
  EMPLOYEE: 13, //"员工"
  ADDRESS: 14, //"地址"
  FLOW_INST: 15, //"关联审批"
  AREA: 16, //"省市区"
};

// 流程指令
export const CMD = {
  START: 0, // "发起"
  AUTO_REJECTED: 1, // "自动拒绝"
  AUTO_APPROVED: 2, // "自动通过"
  REJECTED: 3, // "拒绝"
  APPROVED: 4, // "通过"
  CANCELED: 5, // "撤销"
  ASSIGN: 6, // "转交"
  BACK: 7, // "回退"
  ADD_SIGN: 8, // "加签"
  DEL_SIGN: 9, // "减签"
  ADD_BEFORE_SIGN: 10, // "前加签"
  ADD_AFTER_SIGN: 11, // "后加签"
  COPY: 12, // "抄送"
  FORWARD: 13, // "转发"
  COMMENT: 14, // "评论"
  TRANSACT: 15, // "办理"
};

// 流程状态
export const STATUS = {
  UNDERWAY: 0, //"审批中"
  APPROVED: 1, //"已通过"
  REJECTED: 2, //"不通过"
  CANCELLED: 3, //"已撤销"
};

export const STATUS_LIST = [
  { value: STATUS.UNDERWAY, name: "审批中" },
  { value: STATUS.APPROVED, name: "已通过" },
  { value: STATUS.REJECTED, name: "不通过" },
  { value: STATUS.CANCELLED, name: "已撤销" },
];

// 流程执行人
export const ASSIGNEE = {
  SELF: 0, // "发起人本人"
  SUPERIOR: 1, // "上级"
  DEPARTMENT_LEADER: 2, // "部门负责人"
  ROLE: 3, // "角色"
  ASSIGNEE: 4, // "指定成员"
  MULTISTEP_LEADER: 5, // "连续多级上级"
  MULTISTEP_DEPARTMENT_LEADER: 6, // "连续多级部门负责人"
  INITIATOR_CHOICE: 7, // "发起人自选"
};

// 节点加签类型
export const NODE_SIGN = {
  NONE: 0, //"无"
  ADD_BEFORE_SIGN: 1, //"前加签"
  ADD_AFTER_SIGN: 2, //"后加签"
  ADD_SIGN: 3, //"加签"
  DEL_SIGN: 4, //"减签"
};
