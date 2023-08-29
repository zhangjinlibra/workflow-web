import request from "@/utils/request";

function getOrgTree(params) {
  return request({
    url: "/opentest/getOrgTree",
    method: "get",
    params,
  });
}

function switchUser(params) {
  return request({
    url: "/opentest/switchUser",
    method: "get",
    params,
  });
}

export default { getOrgTree, switchUser };
