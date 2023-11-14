import request from "@/utils/request";

function viewProcessChart(data) {
  return request({
    url: "/flowinstance/viewProcessChart",
    method: "post",
    data,
  });
}

function flowStart(data) {
  return request({
    url: "/flowinstance/launch",
    method: "post",
    data,
  });
}

function listTasks(data) {
  return request({
    url: `/flowinstance/listTasks?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function getById(params) {
  return request({
    url: `/flowinstance/getById`,
    method: "get",
    params,
  });
}

function getForm(params) {
  return request({
    url: "/flowinstance/getForm",
    method: "get",
    params,
  });
}

function getDetail(params) {
  return request({
    url: `/flowinstance/getDetail`,
    method: "get",
    params,
  });
}

function listMineFlowInsts(data) {
  return request({
    url: `/flowinstance/listMineFlowInsts?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function listMineFlowInstCcs(data) {
  return request({
    url: `/flowinstance/listMineFlowInstCcs?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function listMineAuditRecords(data) {
  return request({
    url: `/flowinstance/listMineAuditRecords?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function listFlowInsts(data) {
  return request({
    url: `/flowinstance/listFlowInsts?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function approve(data) {
  return request({
    url: "/flowinstance/approve",
    method: "post",
    data,
  });
}

function reject(data) {
  return request({
    url: "/flowinstance/reject",
    method: "post",
    data,
  });
}

function transact(data) {
  return request({
    url: "/flowinstance/transact",
    method: "post",
    data,
  });
}

function assign(data) {
  return request({
    url: "/flowinstance/assign",
    method: "post",
    data,
  });
}

function cancel(data) {
  return request({
    url: "/flowinstance/cancel",
    method: "post",
    data,
  });
}

function comment(data) {
  return request({
    url: "/flowinstance/comment",
    method: "post",
    data,
  });
}

function jump(data) {
  return request({
    url: "/flowinstance/jump",
    method: "post",
    data,
  });
}

function addBeforeSign(data) {
  return request({
    url: "/flowinstance/addBeforeSign",
    method: "post",
    data,
  });
}

function addAfterSign(data) {
  return request({
    url: "/flowinstance/addAfterSign",
    method: "post",
    data,
  });
}

function addSign(data) {
  return request({
    url: "/flowinstance/addSign",
    method: "post",
    data,
  });
}

function delSign(data) {
  return request({
    url: "/flowinstance/delSign",
    method: "post",
    data,
  });
}

function formModify(data) {
  return request({
    url: "/flowinstance/formModify",
    method: "post",
    data,
  });
}

function listJumpableNodes(params) {
  return request({
    url: "/flowinstance/listJumpableNodes",
    method: "get",
    params,
  });
}

function listRemoveableNodeAssignees(params) {
  return request({
    url: "/flowinstance/listRemoveableNodeAssignees",
    method: "get",
    params,
  });
}

function listFormEditRecords(params) {
  return request({
    url: "/flowinstance/listFormEditRecords",
    method: "get",
    params,
  });
}

function hasFormEditRecord(params) {
  return request({
    url: "/flowinstance/hasFormEditRecord",
    method: "get",
    params,
  });
}

export default {
  viewProcessChart,
  flowStart,
  listTasks,
  getById,
  getForm,
  getDetail,
  approve,
  reject,
  transact,
  assign,
  listMineFlowInsts,
  listMineFlowInstCcs,
  listMineAuditRecords,
  cancel,
  comment,
  listJumpableNodes,
  jump,
  addBeforeSign,
  addAfterSign,
  addSign,
  delSign,
  formModify,
  listRemoveableNodeAssignees,
  listFlowInsts,
  listFormEditRecords,
  hasFormEditRecord,
};
