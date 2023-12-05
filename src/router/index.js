import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/layout/index.vue";

export const constantRoutes = [
  {
    path: "/",
    name: "/",
    redirect: "/flowstart",
    component: Layout,
    meta: { title: "审批", icon: "menu-flow", roles: ["admin"] },
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
    meta: { title: "审批管理", icon: "menu-flow-manage", roles: ["admin"] },
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
    path: "/flowdata",
    name: "/flowdata",
    component: Layout,
    meta: { title: "数据管理", icon: "menu-flow-data", roles: ["admin"] },
    children: [
      {
        path: "/flowdataindex",
        name: "/flowdataindex",
        component: () => import("@/views/flow-data/index.vue"),
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

// 遍历子路由，全部转换为绝对路径
const fixChildrenRoute = (parent, children) => {
  let prefix = parent.path === "/" ? "" : parent.path;
  (children || []).forEach((child) => {
    let { path, name } = child;
    if (!path.startsWith("/")) child.path = `${prefix}/${path}`;
    if (!name.startsWith("/")) child.name = `${prefix}/${name}`;
    fixChildrenRoute(child, child.children);
  });
};

// 遍历路由，全部转换为绝对路径
let fixRoutes = (routes) => {
  routes.forEach((route) => {
    fixChildrenRoute(route, route.children);
  });
  return routes;
};

const newRouter = () => {
  return createRouter({
    scrollBehavior: () => ({ top: 0 }),
    history: createWebHistory(),
    routes: fixRoutes(constantRoutes),
  });
};

const router = newRouter();

export function resetRouter() {
  const router0 = newRouter();
  router.matcher = router0.matcher;
}

export default router;
