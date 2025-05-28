import { WIDGET } from "@/components/flow/common/FlowConstant";
import { useOrganStore } from "@/stores";
import ArrayUtil from "./ArrayUtil";
import ObjectUtil from "./ObjectUtil";

// 上面三个参数一一对应
export const operators = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 21];
export const names = {
  0: "等于",
  1: "不等于",
  2: "小于",
  3: "小于等于",
  4: "大于",
  5: "大于等于",
  10: "包含于",
  11: "不包含于",
  12: "等于",
  13: "不等于",
  14: "包含",
  15: "不包含",
  20: "属于",
  21: "不属于",
};
export const exps = {
  // 数值操作
  0: (v, t) => `${v}==${t}`,
  1: (v, t) => `${v}!=${t}`,
  2: (v, t) => `${v}<${t}`,
  3: (v, t) => `${v}<=${t}`,
  4: (v, t) => `${v}>${t}`,
  5: (v, t) => `${v}>=${t}`,
  // 字符串操作
  10: (v, t) => `fx.in0(${v},"${t}")`,
  11: (v, t) => `!fx.in0(${v},"${t}")`,
  12: (v, t) => `fx.eq0(${v},"${t}")`,
  13: (v, t) => `!fx.eq0(${v},"${t}")`,
  14: (v, t) => `fx.contain0(${v},"${t}")`,
  15: (v, t) => `!fx.contain0(${v},"${t}")`,
  // 数组操作
  20: (v, t) => {
    if (Array.isArray(t)) {
      let prams = t.map((v) => `"${v}"`).join(",");
      return `fx.has0(${v},${prams})`;
    } else {
      return `fx.has0(${v},"${t}")`;
    }
  },
  21: (v, t) => {
    if (Array.isArray(t)) {
      let prams = t.map((v) => `"${v}"`).join(",");
      return `!fx.has0(${v},${prams})`;
    } else {
      return `!fx.has0(${v},"${t}")`;
    }
  },
};

// 发起人变量名称
export const INITIATOR_VAR_NAME = "initiator";

const initiatorIn = (v, t) => {
  let prams = t.map((v) => `"${v}"`).join(",");
  return `fo.belong(businessKey,${v},${prams})`;
};

const initiatorNotIn = (v, t) => {
  let prams = t.map((v) => `"${v}"`).join(",");
  return `!fo.belong(businessKey,${v},${prams})`;
};

// 根据名称查询组件
const lookupWidget = (flowWidgets, name) => {
  if (flowWidgets && flowWidgets.length) {
    for (let flowWidget of flowWidgets) {
      if (flowWidget.name == name) return flowWidget;
      if (flowWidget.type == WIDGET.DETAIL) {
        for (let detail of flowWidget.details || []) {
          if (detail.name == name) return detail;
        }
      }
    }
  }
  return null;
};

// 获取组件名称
const lookupWidgetLabel = (flowWidget) => {
  return flowWidget ? flowWidget.label : "";
};

// 条件节点卡片上的展示文字
export const showExpNodeContent = (branchNode, flowWidgets) => {
  let { getById, getDeptById, getUserById } = useOrganStore();
  let { conditionGroups } = branchNode;
  return (
    "当 " +
    conditionGroups
      .map((conditionGroup) => {
        let { conditions } = conditionGroup;
        return conditions
          .filter((e) => ObjectUtil.isNotNull(e.varName) && ObjectUtil.isNotNull(e.operator) && ObjectUtil.isNotNull(e.val))
          .map((condition) => {
            let { varName, operator, val } = condition;
            let name, operatorName, newVal;
            if (varName === INITIATOR_VAR_NAME) {
              name = "发起人";
              operatorName = names[operator];
              newVal = val.map((i) => getById(i).name).join("/");
            } else {
              let widget = lookupWidget(flowWidgets, varName);
              name = lookupWidgetLabel(widget);
              operatorName = names[operator];
              if (widget.type == WIDGET.DEPARTMENT) {
                newVal = ObjectUtil.isArray(val) ? val.map((id) => getDeptById(id).name).join("/") : getDeptById(val).name;
              } else if (widget.type == WIDGET.EMPLOYEE) {
                newVal = ObjectUtil.isArray(val) ? val.map((id) => getUserById(id).name).join("/") : getUserById(val).name;
              } else {
                newVal = [20, 21].includes(operator) ? val.join("/") : val;
              }
            }
            return `${name} ${operatorName} ${newVal}`;
            // return name + " " + operatorName + " " + newVal;
          })
          .join(" 且 ");
      })
      .join(" 或 ")
  );
};

// 组装分支表达式
export const initBranchExp = (nodeConfig) => {
  recursiveBranchNode(nodeConfig);
};

// 遍历所有的分支节点
const recursiveBranchNode = (node) => {
  let { childNode, conditionNodes } = node || {};
  // 任务节点
  if (childNode) recursiveBranchNode(childNode);
  // 分支
  if (conditionNodes && conditionNodes.length > 0) {
    conditionNodes.forEach((conditionNode) => {
      let { childNode: childNode2, conditionNodes: conditionNodes2, conditionGroups } = conditionNode;
      if (childNode2) recursiveBranchNode(childNode2); // 任务节点
      if (conditionNodes2 && conditionNodes2.length > 0) conditionNodes2.forEach((conditionNode2) => recursiveBranchNode(conditionNode2));
      // 条件组
      if (conditionGroups && conditionGroups.length > 0) initExp(conditionNode);
    });
  }
};

// 构造分支条件表达式
export const initExp = (branchNode) => {
  let exp = branchNode.conditionGroups
    .map((conditionGroup) => {
      let { conditions } = conditionGroup;
      let subExp = conditions
        .filter((e) => ObjectUtil.isNotNull(e.varName) && ObjectUtil.isNotNull(e.operator) && ObjectUtil.isNotNull(e.val))
        .map((condition) => {
          let { varName, val, operator } = condition;
          let fun, newVal, segexp;
          if (varName === INITIATOR_VAR_NAME) {
            fun = operator == 20 ? initiatorIn : initiatorNotIn;
            newVal = val.map((i) => i);
            segexp = fun(varName, newVal);
          } else {
            fun = exps[operator];
            newVal = val;
            segexp = fun(varName, newVal);
          }
          console.log(fun, newVal, segexp);
          return segexp;
        })
        .join("&&");
      return `(${subExp})`;
    })
    .join("||");
  branchNode.conditionExpression = "${" + exp + "}";
};

// 可以作为条件的组件
const branchWidgets = [
  WIDGET.SINGLELINE_TEXT,
  WIDGET.NUMBER,
  WIDGET.MONEY,
  WIDGET.SINGLE_CHOICE,
  WIDGET.MULTI_CHOICE,
  WIDGET.DATE,
  WIDGET.DATE_RANGE,
  WIDGET.DEPARTMENT,
  WIDGET.EMPLOYEE,
  WIDGET.DETAIL,
  WIDGET.FORMULA,
];
// const branchDetailWidgets = [WIDGET.NUMBER, WIDGET.MONEY];

// 条件分支中，不可引用的组件需要被清除掉
export const cleanUnrequiredWidget = (flowWidgets, nodeConfig) => {
  let quotable = []; // 可被作为变量的组件
  (flowWidgets || []).forEach((flowWidget) => {
    let { type, required, details, formulaItems } = flowWidget;
    if ((required && branchWidgets.includes(type)) || WIDGET.FORMULA == type) {
      quotable.push(flowWidget);
    } else if (WIDGET.DETAIL == type && details && details.length && formulaItems && formulaItems.length) {
      quotable.push(flowWidget);
      // (flowWidget.details || []).forEach((detail) => {
      //   if (detail.required && branchDetailWidgets.includes(detail.type)) {
      //     quotable.push(detail);
      //   }
      // });
    }
  });
  quotable = quotable.map((i) => i.name);
  quotable.push(INITIATOR_VAR_NAME); // 添加固定的变量
  rmNotRequiredWidget(nodeConfig, quotable);
};

// 删除依赖非填项的分支条件
const rmNotRequiredWidget = (node, requireds) => {
  let { childNode, conditionNodes } = node || {};
  // 任务节点
  if (childNode) rmNotRequiredWidget(childNode, requireds);
  // 分支
  if (conditionNodes && conditionNodes.length > 0) {
    conditionNodes.forEach((conditionNode) => {
      let { childNode: childNode2, conditionNodes: conditionNodes2, conditionGroups } = conditionNode;
      if (childNode2) rmNotRequiredWidget(childNode2, requireds); // 任务节点
      if (conditionNodes2 && conditionNodes2.length > 0)
        conditionNodes2.forEach((conditionNode2) => rmNotRequiredWidget(conditionNode2, requireds));
      // 条件组
      if (conditionGroups && conditionGroups.length > 0) {
        let rmConditionGroupIds = [];
        conditionGroups.forEach((conditionGroup) => {
          let { conditions, id } = conditionGroup;
          let rmConditionVarNames = [];
          if (conditions && conditions.length > 0) {
            conditions.forEach((condition) => {
              let { varName } = condition;
              if (!requireds.includes(varName)) rmConditionVarNames.push(varName);
            });
          }

          // 单个条件
          if (rmConditionVarNames.length > 0) {
            rmConditionVarNames.forEach((varName) => {
              ArrayUtil.remove(conditions, "varName", varName);
            });
          }
          if (conditions.length == 0) rmConditionGroupIds.push(id);
        });

        // 删除空的条件组
        if (rmConditionGroupIds.length > 0) {
          rmConditionGroupIds.forEach((id) => {
            ArrayUtil.remove(conditionGroups, "id", id);
          });
        }
      }
    });
  }
};
