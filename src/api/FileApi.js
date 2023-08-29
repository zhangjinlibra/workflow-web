import request from "@/utils/request";

function metadata(params) {
  return request({
    url: "/flowfile/metadata",
    method: "get",
    params,
  });
}

function batchMetadata(params) {
  return request({
    url: "/flowfile/batchMetadata",
    method: "get",
    params,
  });
}

export const FILE_BASE_URL = import.meta.env.VITE_APP_BASE_URL + "/flowfile";
export default { metadata, batchMetadata };
