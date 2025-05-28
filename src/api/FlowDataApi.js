import request from "@/utils/request";

function listFlowInsts(data) {
  return request({
    url: `/flowdata/listFlowInsts?page=${data.page}&size=${data.size}`,
    method: "post",
    data,
  });
}

function listFlowInstAssignees(params) {
  return request({
    url: `/flowdata/listFlowInstAssignees`,
    method: "get",
    params,
  });
}

function transfer(data) {
  return request({
    url: "/flowdata/transfer",
    method: "post",
    data,
  });
}

function doExport(data) {
  return request({
    url: `/flowdata/export`,
    method: "post",
    data,
  });
}

export default {
  listFlowInsts,
  listFlowInstAssignees,
  transfer,
  doExport,
};
