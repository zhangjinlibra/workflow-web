import request from "@/utils/request";

function listSvgIcons(params) {
  return request({
    url: "/icon/listSvgIcons",
    method: "get",
    params,
  });
}

export const ICON_BASE_URL = import.meta.env.VITE_APP_BASE_URL + "/icon/svg/";
export default { listSvgIcons };
