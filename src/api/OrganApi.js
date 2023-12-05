import { useOrganStore } from "@/stores";
import request from "@/utils/request";

// 数据缓存
let cache = {
  loaded: false,
};

/**
 * 获取部门
 * @param {*} params
 * @returns
 */
export function listDepts(params) {
  return request({
    url: "/organ/listDepts",
    method: "get",
    params,
  });
}

/**
 * 获取角色
 * @param {*} params
 * @returns
 */
export function listRoles(params) {
  return request({
    url: "/organ/listRoles",
    method: "get",
    params,
  });
}

/**
 * 获取职员
 * @param {*} params
 * @returns
 */
export function listUsers(params) {
  return request({
    url: "/organ/listUsers",
    method: "get",
    params,
  });
}

export function getUserDetail(params) {
  let { userId } = params;
  if (!userId) {
    console.log("userId is null", params);
    return new Promise((resolve, reject) => {
      reject();
    });
  }

  let userDetail = cache[userId];
  if (userDetail) {
    return new Promise((resolve, reject) => {
      resolve({ code: 1, data: userDetail });
    });
  } else {
    return request({
      url: "/organ/getUserDetail",
      method: "get",
      params,
    }).then((resp) => {
      let { code, data: detail } = resp;
      if (code == 1 && detail && detail.name) {
        cache[userId] = resp.data;
      }
      return resp;
    });
  }
}

export function getLoginUserDetail(params) {
  return request({
    url: "/organ/getLoginUserDetail",
    method: "get",
    params,
  });
}

export function loadOrgan() {
  if (!cache.loaded) {
    const { setDepts, setRoles, setUsers } = useOrganStore();
    listDepts().then((resp) => {
      if (resp.code == 1) setDepts(resp.data);
    });
    listRoles().then((resp) => {
      if (resp.code == 1) setRoles(resp.data);
    });
    listUsers().then((resp) => {
      if (resp.code == 1) setUsers(resp.data);
    });
    cache.loaded = true;
  }
}

export default { loadOrgan, listDepts, listRoles, listUsers, getUserDetail, getLoginUserDetail };
