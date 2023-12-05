"use strict";
import { NODE, WIDGET, ASSIGNEE } from "@/components/flow/common/FlowConstant";
import { isArray, isNull, isNumber, isObject, isString, isUndefined } from "@/utils/is";
import { flow } from "lodash";
import array from "lodash/array";
import validator from "validator";

// 流程结构示例
const example = {
  nodeConfig: {
    name: "发起",
    type: 0,
    childNode: {
      name: "路由",
      type: 4,
      childNode: null,
      conditionNodes: [
        {
          name: "条件1",
          type: 3,
          childNode: {
            name: "审核",
            type: 1,
            backable: true,
            signable: true,
            assignees: [{ rid: "630679044886630400", assigneeType: 0 }],
            childNode: null,
            assignable: true,
            approvalType: 0,
            flowNodeNoAuditorType: 0,
            flowNodeSelfAuditorType: 0,
            multiInstanceApprovalType: 0,
          },
          priorityLevel: 1,
          conditionGroups: [
            {
              id: "635296659764416512",
              conditions: [{ id: "635296659764416513", val: ["1000", "1001"], varName: "initiator", operator: 20, operators: [20, 21] }],
            },
          ],
          conditionExpression: '${(fo.belong(businessKey,initiator,"1000","1001"))}',
        },
        {
          name: "条件2",
          type: 3,
          childNode: {
            name: "办理",
            type: 5,
            childNode: null,
            assignable: true,
            transactors: [{ rid: "635296716022616064", transactorType: 0 }],
            approvalType: 0,
            flowNodeNoAuditorType: 2,
            multiInstanceApprovalType: 0,
          },
          priorityLevel: 2,
          conditionGroups: [],
        },
      ],
    },
  },
  flowWidgets: [{ name: "SELECT_635294882201604096", type: 5, label: "单选", options: ["1"], placeholder: "请选择" }],
  workFlowDef: { id: "1710837703820316674", icon: "approval", name: "报销", groupId: "1706220240700907522", cancelable: 1, flowAdminIds: ["1"] },
  flowPermission: {
    type: 1,
    flowInitiators: [
      { id: "1000", type: 0 },
      { id: "1001", type: 0 },
      { id: "1002", type: 0 },
    ],
  },
};

const verifyBaseInfo = (baseInfo) => {
  console.log("校验基本信息", baseInfo);
  let errs = [];
  const prefix = "【基础信息】";
  let { name, icon, groupId, flowAdminIds } = baseInfo || {};
  if (!isString(icon) || validator.isEmpty(icon)) errs.push(`${prefix} 请选择流程图标`);
  if (!isString(name) || validator.isEmpty(name)) errs.push(`${prefix} 请设置流程名称`);
  if (!isString(groupId) || validator.isEmpty(groupId)) errs.push(`${prefix} 请选择流程分组`);
  if (!isArray(flowAdminIds) || flowAdminIds.length == 0) errs.push(`${prefix} 请添加流程管理员`);
  return errs;
};

const verifyFormInfo = (flowWidgets) => {
  console.log("校验表单", flowWidgets);
  let errs = [];
  const prefix = "【表单设计】";
  if (!isArray(flowWidgets) || flowWidgets.length == 0) {
    errs.push(`${prefix} 请设计流程表单`);
  } else {
    // 选项校验函数
    const valifySelectWidgetOptions = (widget) => {
      if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(widget.type)) {
        let { options } = widget;
        if (!isArray(options) || options.length == 0) {
          errs.push(`${prefix} 请为控件（${widget.label}）添加选择项`);
        } else {
          if (array.uniq(options).length == options.length) {
            options.forEach((option) => {
              if (!isString(option) || validator.isEmpty(option)) {
                errs.push(`${prefix} 控件（${widget.label}）的选项不能为空`);
              }
            });
          } else {
            // 存在重复选项
            errs.push(`${prefix} 控件（${widget.label}）的选项不能重复`);
          }
        }
      }
    };

    // 校验选项空间是否合法
    flowWidgets.forEach((flowWidget) => {
      if ([WIDGET.DETAIL].includes(flowWidget.type)) {
        // 校验明细组件
        let { details } = flowWidget;
        if (!isArray(details) || details.length == 0) {
          errs.push(`${prefix} 请为明细控件（${flowWidget.label}）添加控件`);
        } else {
          details.forEach((detail) => valifySelectWidgetOptions(detail));
        }
      } else if ([WIDGET.SINGLE_CHOICE, WIDGET.MULTI_CHOICE].includes(flowWidget.type)) {
        // 校验选择框选项
        valifySelectWidgetOptions(flowWidget);
      }
    });
  }
  return errs;
};

const verifyFlowInfo = (startNode, flowPermission) => {
  // console.log("校验节点", startNode);
  let errs = [];
  const prefix = "【流程设计】";

  // 检查流程发起人
  if (!isObject(flowPermission)) {
    errs.push(`${prefix} 请配置发起节点`);
  } else {
    let { flowInitiators, type } = flowPermission;
    if (type == 1 && !(isArray(flowInitiators) && flowInitiators.length > 0)) {
      errs.push(`${prefix} 流程发起人为指定成员时, 发起人列表不能为空`);
    }
  }

  // 检查流程节点
  let { childNode } = startNode;
  if (!isObject(childNode)) errs.push(`${prefix} 流程至少添加一个审批节点`);
  verifyFlowNodeInfo(childNode, prefix, errs);
  return errs;
};

const verifyFlowNodeInfo = (flowNode, prefix, errs, isLastBranchNode = false) => {
  // console.log("校验节点", flowNode);
  // 校验当前节点
  if (flowNode && isObject(flowNode)) {
    let { type, name, conditionGroups } = flowNode;
    if (!isString(name) || validator.isEmpty(name)) errs.push(`${prefix} 请为${name}节点设置名称`);
    if (type == NODE.CONDITION) {
      //校验分支节点, 最后一个默认分支不校验
      if (!isLastBranchNode) {
        if (!(isArray(conditionGroups) && conditionGroups.length > 0)) {
          errs.push(`${prefix} 请为${name}节点设置分组条件`);
        } else {
          conditionGroups.forEach((conditionGroup) => {
            let { conditions } = conditionGroup;
            if (isArray(conditions) && conditions.length > 0) {
              conditions.forEach((condition) => {
                // 校验单个条件
                let { varName, operator, val } = condition;
                if (!isString(varName) || validator.isEmpty(varName)) errs.push(`${prefix} 请为${name}节点选择变量`);
                if (!isNumber(operator)) errs.push(`${prefix} 请为${name}节点选择操作符`);
                if (isUndefined(val) || isNull(val) || (isString(val) && validator.isEmpty(val)) || (isArray(val) && val.length == 0)) {
                  errs.push(`${prefix} 请为${name}节点添加比较值`);
                }
              });
            } else {
              errs.push(`${prefix} 请为${name}节点设置分组条件`);
            }
          });
        }
      }
    } else if (type == NODE.APPROVE) {
      //校验审批节点
      let { flowNodeNoAuditorType, flowNodeNoAuditorAssignee, flowNodeAuditAdmin, assignees } = flowNode;
      assignees?.forEach((assignee) => {
        let { assigneeType, assignees, roles } = assignee;
        if (assigneeType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择审批角色`);
        if (assigneeType == ASSIGNEE.ASSIGNEE && !(assignees && assignees.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定审批人`);
      });
      if (flowNodeNoAuditorType == 1) {
        if (!isString(flowNodeNoAuditorAssignee) || validator.isEmpty(flowNodeNoAuditorAssignee)) {
          errs.push(`${prefix} 请为${name}节点选择审批人为空时的指定办理成员`);
        }
      } else if (flowNodeNoAuditorType == 2) {
        if (!isString(flowNodeAuditAdmin) || validator.isEmpty(flowNodeAuditAdmin)) {
          errs.push(`${prefix} 请为${name}节点选择审批人为空时的审批管理员`);
        }
      }
    } else if (type == NODE.COPY) {
      // 校验抄送节点
      let { ccs } = flowNode;
      ccs?.forEach((cc) => {
        let { ccType, assignees, roles } = cc;
        if (ccType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择抄送角色`);
        if (ccType == ASSIGNEE.ASSIGNEE && !(assignees && assignees.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定抄送人`);
      });
    } else if (type == NODE.TRANSACT) {
      // 校验办理节点
      let { flowNodeNoAuditorType, flowNodeNoAuditorAssignee, flowNodeAuditAdmin, transactors } = flowNode;
      transactors?.forEach((transactor) => {
        let { transactorType, assignees, roles } = transactor;
        if (transactorType == ASSIGNEE.ROLE && !(roles && roles.length > 0)) errs.push(`${prefix} 请为${name}节点选择办理角色`);
        if (transactorType == ASSIGNEE.ASSIGNEE && !(assignees && assignees.length > 0)) errs.push(`${prefix} 请为${name}节点选择指定办理人`);
      });
      if (flowNodeNoAuditorType == 1) {
        if (!isString(flowNodeNoAuditorAssignee) || validator.isEmpty(flowNodeNoAuditorAssignee)) {
          errs.push(`${prefix} 请为${name}节点选择办理人为空时的指定办理成员`);
        }
      } else if (flowNodeNoAuditorType == 2) {
        if (!isString(flowNodeAuditAdmin) || validator.isEmpty(flowNodeAuditAdmin)) {
          errs.push(`${prefix} 请为${name}节点选择办理人为空时的审批管理员`);
        }
      }
    }

    // 校验子节点和条件分支
    let { childNode, conditionNodes } = flowNode;
    // 校验分支条件
    if (isArray(conditionNodes) && conditionNodes.length > 0) {
      // conditionNodes.forEach((node) => verifyFlowNodeInfo(node, prefix, errs));
      for (let idx = 0; idx < conditionNodes.length; idx++) {
        const node = conditionNodes[idx];
        verifyFlowNodeInfo(node, prefix, errs, idx + 1 == conditionNodes.length);
      }
    }
    // 校验子节点
    verifyFlowNodeInfo(childNode, prefix, errs);
  }
};

export default { verifyBaseInfo, verifyFormInfo, verifyFlowInfo };
