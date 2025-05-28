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
export const FILE_UPLOAD_URL = FILE_BASE_URL + "/upload"; // 文件上传地址
export const FILE_PREVIEW_URL = FILE_BASE_URL + "/preview"; // 文件预览地址
export const FILE_DOWNLOAD_URL = FILE_BASE_URL + "/download"; // 文件下载地址
export default { metadata, batchMetadata };
