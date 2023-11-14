import request from "@/utils/request";
import { WIDGET } from "@/components/flow/common/FlowConstant";

function listGroups(params) {
  return request({
    url: "/flowdefinition/listGroups",
    method: "get",
    params,
  });
}

function listGroupsWithFlowDefinition(params) {
  return request({
    url: "/flowdefinition/listGroupsWithFlowDefinition",
    method: "get",
    params,
  });
}

function listGroupsWithEnabledFlowDefinition(params) {
  return request({
    url: "/flowdefinition/listGroupsWithEnabledFlowDefinition",
    method: "get",
    params,
  });
}

function saveOrUpdateGroup(data) {
  return request({
    url: "/flowdefinition/saveOrUpdateGroup",
    method: "post",
    data,
  });
}

function deleteGroup(params) {
  return request({
    url: "/flowdefinition/deleteGroup",
    method: "get",
    params,
  });
}

function listFlowDefinitions(params) {
  return request({
    url: "/flowdefinition/listFlowDefinitions",
    method: "get",
    params,
  });
}

function getFlowConfig(params) {
  return request({
    url: "/flowdefinition/getFlowConfig",
    method: "get",
    params,
  }).then((resp) => {
    let flowDefJson = {};
    if (resp.code == 1) {
      flowDefJson = JSON.parse(resp.data.flowDefJson);
      let { workFlowDef } = flowDefJson;
      workFlowDef.id = resp.data.flowDefId;
    }
    return flowDefJson;
  });
}

function saveOrUpdate(data) {
  return request({
    url: "/flowdefinition/saveOrUpdate",
    method: "post",
    data,
  });
}

function removeById(params) {
  return request({
    url: "/flowdefinition/removeById",
    method: "get",
    params,
  });
}

function freezeById(params) {
  return request({
    url: "/flowdefinition/freezeById",
    method: "get",
    params,
  });
}

function enableById(params) {
  return request({
    url: "/flowdefinition/enableById",
    method: "get",
    params,
  });
}

function getFlowFormWidget(params) {
  return request({
    url: "/flowdefinition/getFlowFormWidget",
    method: "get",
    params,
  });
}

// function getFlowForm(params) {
//   return request({
//     url: "/flowdefinition/getFlowForm",
//     method: "get",
//     params,
//   });
// }

function formWidgetListToMap(flowWidgets) {
  let flowWidgetMap = {};
  flowWidgets.forEach((flowWidget) => {
    let { name, type, details } = flowWidget;
    flowWidgetMap[name] = flowWidget;
    if (type == WIDGET.DETAIL) details.forEach((detail) => (flowWidgetMap[detail.name] = detail));
  });
  return flowWidgetMap;
}

export default {
  listGroups,
  listGroupsWithFlowDefinition,
  listGroupsWithEnabledFlowDefinition,
  saveOrUpdateGroup,
  deleteGroup,
  listFlowDefinitions,
  getFlowConfig,
  removeById,
  saveOrUpdate,
  freezeById,
  enableById,
  getFlowFormWidget,
  formWidgetListToMap,
};
