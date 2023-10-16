import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/layout/index.vue";

export const constantRoutes = [
  {
    path: "/",
    name: "/",
    redirect: "/flowstart",
    component: Layout,
    meta: { title: "审批", icon: "&#xe614;", roles: ["admin"] },
    children: [
      {
        path: "flowstart",
        name: "flowstart",
        component: () => import("@/views/my-flow/flow-start.vue"),
        meta: { title: "发起申请", roles: ["admin"] },
      },
      {
        path: "flowappvove",
        name: "flowappvove",
        component: () => import("@/views/my-flow/flow-approve.vue"),
        meta: { title: "待审批", roles: ["admin"] },
      },
      {
        path: "flowmy",
        name: "flowmy",
        component: () => import("@/views/my-flow/flow-my.vue"),
        meta: { title: "我的申请", roles: ["admin"] },
      },
      {
        path: "flowcc",
        name: "flowcc",
        component: () => import("@/views/my-flow/flow-cc.vue"),
        meta: { title: "我收到的", roles: ["admin"] },
      },
      {
        path: "flowrecord",
        name: "flowrecord",
        component: () => import("@/views/my-flow/flow-record.vue"),
        meta: { title: "已审批", roles: ["admin"] },
      },
    ],
  },
  {
    path: "/flowmanage",
    name: "/flowmanage",
    component: Layout,
    meta: { title: "审批管理", icon: "&#xe65A;", roles: ["admin"] },
    children: [
      {
        path: "/flowmanindex",
        name: "/flowmanindex",
        component: () => import("@/views/flow-manage/index.vue"),
        meta: { roles: ["admin"] },
      },
    ],
  },
  {
    path: "/flowmanedit",
    name: "/flowmanedit",
    component: () => import("@/views/flow-manage/flow-edit.vue"),
    meta: { transition: "fade-transform", roles: ["admin"] },
    hidden: true,
  },
];

export const asyncRoutes = [];

const newRouter = () => {
  return createRouter({
    scrollBehavior: () => ({ y: 0 }),
    history: createWebHistory(import.meta.env.VITE_BASE_PATH),
    routes: constantRoutes,
  });
};

const router = newRouter();

export function resetRouter() {
  const router0 = newRouter();
  router.matcher = router0.matcher;
}

export default router;
