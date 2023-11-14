import { NODE, WIDGET } from "@/components/flow/common/FlowConstant";

/**
 * 筛选出所有作为条件的组件
 *
 * @param {Object} startNode 流程开始节点
 * @param {Array} conditionWidgets 空的数组
 */
export function filterConditionWidgets(startNode, conditionWidgets) {
  let { childNode, conditionNodes } = startNode || {};
  if (childNode) filterConditionWidgets(childNode, conditionWidgets);
  (conditionNodes || []).forEach((conditionNode) => {
    if (conditionNode.childNode) filterConditionWidgets(conditionNode.childNode, conditionWidgets);
    (conditionNode.conditionGroups || []).forEach((conditionGroup) => {
      (conditionGroup.conditions || []).forEach((condition) => {
        let { varName } = condition;
        if (varName && varName !== "initiator") conditionWidgets.push(varName);
      });
    });
  });
}

/**
 * 根据名称筛选出组件
 *
 * @param {Array} widgets
 * @param {String} name
 * @returns widget
 */
const filterFormAuth = (widgets, name) => {
  let item = null;
  for (let i = 0; i < widgets.length; i++) {
    let widget = widgets[i];
    if (widget.type == WIDGET.DETAIL) {
      let details = widget.details || [];
      for (let ii = 0; ii < details.length; ii++) {
        let detail = details[ii];
        if (detail.name == name) return detail;
      }
    } else {
      if (widget.name == name) return widget;
    }
  }
  return item;
};

/**
 * 重新设置所有节点的表单权限
 *
 * @param {Object} startNode 流程开始节点
 * @param {Array} widgets 所有表单组件
 * @param {Array} conditionWidgets 条件节点使用的表单组件数组
 */
export function resetAllNodeFormAuth(startNode, widgets, conditionWidgets) {
  if (!startNode) startNode;
  let { childNode, conditionNodes, type } = startNode;
  if ([NODE.APPROVE, NODE.TRANSACT, NODE.COPY].includes(type)) {
    initNodeFormAuth(startNode, widgets, conditionWidgets);
  }
  if (childNode) resetAllNodeFormAuth(childNode, widgets, conditionWidgets);
  if (conditionNodes) conditionNodes.forEach((conditionNode) => resetAllNodeFormAuth(conditionNode, widgets, conditionWidgets));
}

/**
 * 初始化节点的标签权限
 * 表单选线写到节点的formAuths属性下面
 *
 * @param {Object} node 需要设置表单权限的节点
 * @param {Array} widgets 所有表单组件
 * @param {Array} conditionWidgets 条件节点使用的表单组件数组
 */
export function initNodeFormAuth(node, widgets, conditionWidgets) {
  let formAuths = node.formAuths;
  if (!!!formAuths) {
    formAuths = (widgets || []).map((widget) => {
      let { name, label, type } = widget;
      let formAuth;
      if (type == WIDGET.DETAIL) {
        formAuth = { name, type, label };
        formAuth.details = (widget.details || []).map((detail) => {
          return { name: detail.name, type: detail.type, label: detail.label, readable: true, editable: false };
        });
      } else {
        formAuth = { name, type, label, readable: true, editable: false };
      }
      return formAuth;
    });
  } else {
    formAuths = (widgets || []).map((widget) => {
      let { name, label, type } = widget;
      let formAuth;
      if (type == WIDGET.DETAIL) {
        formAuth = { name, type, label };
        formAuth.details = (widget.details || []).map((detail) => {
          let item = filterFormAuth(formAuths, detail.name);
          let readable = item ? item.readable : true;
          let editable = item ? item.editable : false;
          if (conditionWidgets.includes(detail.name)) editable = false;
          return { name: detail.name, type: detail.type, label: detail.label, readable, editable };
        });
      } else {
        let item = filterFormAuth(formAuths, name);
        let readable = item ? item.readable : true;
        let editable = item ? item.editable : false;
        if (conditionWidgets.includes(name)) editable = false;
        formAuth = { name, type, label, readable, editable };
      }
      return formAuth;
    });
  }
  node.formAuths = formAuths;
}
