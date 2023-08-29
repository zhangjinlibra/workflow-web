const example = {
  // 基本信息
  workFlowDef: {
    name: "审批",
    bg: "#6AC757",
    icon: "&#xe607;",
    groupId: "1674241742759628802",
    flowAdminIds: [
      { id: "1", name: "审核管理员", type: 0 },
      { id: "2", name: "人事部", type: 0 },
    ],
    cancelable: true,
  },
  // 节点信息
  nodeConfig: {
    name: "发起人",
    type: 0,
    childNode: {
      name: "审核人",
      type: 1,
      approvalType: 0,
      multiInstanceApprovalType: 0,
      flowNodeNoAuditorType: 0,
      flowNodeSelfAuditorType: 0,
      assignees: [{ rid: "598708383259824128", assigneeType: 0, layerType: 0 }],
      childNode: null,
    },
  },
  // 流程发起人
  flowPermission: {
    type: 1,
    flowInitiators: [
      { id: "1", name: "审核管理员", type: 0 },
      { id: "2", name: "人事部", type: 0 },
    ],
  },
  // 流程表单
  flowWidgets: [{ type: 0, label: "单行文本", placeholder: "请输入", name: "598708366671351808" }],
};

const validateFlowBaseInfo = (baseInfo) => {
  console.log("校验基本信息", baseInfo);
  let { name, icon, groupId, flowAdminIds } = baseInfo || {};
  let errs = [];
  const prefix = "【基础信息】";
  if (!name || name == "") errs.push(`${prefix} 请设置流程名称`);
  if (!icon || icon == "") errs.push(`${prefix} 请设置流程图标`);
  if (!groupId || groupId == "") errs.push(`${prefix} 请选择流程分组`);
  if (!flowAdminIds || flowAdminIds.length == 0) errs.push(`${prefix} 请添加流程管理员`);
  // else flowAdminIds.forEach((admin) => (admin.adminId = admin.id)); // 把id转换成adminId
  return errs;
};

const validateFlowWidgets = (flowWidgets) => {
  console.log("校验表单", flowWidgets);
  let errs = [];
  const prefix = "【表单设计】";
  if (!flowWidgets || flowWidgets.length == 0) {
    errs.push(`${prefix} 请设置流程表单`);
  } else {
    flowWidgets.forEach((flowWidget) => {
      const valifySelectOptions = (widget) => {
        if ([5, 6].includes(widget.type)) {
          let { options } = widget;
          if (!options || options.length == 0) {
            errs.push(`${prefix} 请添加选项控件（${widget.label}）的选择项`);
          } else {
            options.forEach((option) => {
              if (!option || option == "") {
                errs.push(`${prefix} 选项控件（${widget.label}）的选择项不能为空`);
              }
            });
          }
        }
      };

      if ([9].includes(flowWidget.type)) {
        // 校验明细组件
        let { details } = flowWidget;
        if (!details || details.length == 0) {
          errs.push(`${prefix} 请为明细控件（${flowWidget.label}）添加控件`);
        } else {
          details.forEach((detail) => valifySelectOptions(detail));
        }
      } else if ([5, 6].includes(flowWidget.type)) {
        // 校验选择框选项
        valifySelectOptions(flowWidget);
      }
    });
  }
  return errs;
};

const validateFlowNode = (startNode) => {
  console.log("校验节点", startNode);
  let errs = [];
  const prefix = "【流程设计】";
  let { childNode } = startNode;
  if (!childNode) errs.push(`${prefix} 至少添加一个审核节点`);
  return errs;
};

export default { validateFlowBaseInfo, validateFlowWidgets, validateFlowNode };
