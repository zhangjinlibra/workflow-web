import Cookies from "js-cookie";
import { getToken } from "@/utils/auth";
const domain = import.meta.env.WEBSITE_COOKIE_DOMAIN;

// 开放测试租户id
const tenantId = "flow_test";
Cookies.set("tenantId", tenantId, { SameSite: "lax", domain });

// 填充cookie
const token = getToken();
token && Cookies.set("token", token, { SameSite: "lax" });
