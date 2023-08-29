import { defineStore } from "pinia";
import { asyncRoutes, constantRoutes } from "@/router";

const usePermissionStore = defineStore("permission", {
  state: () => ({
    routes: [],
    addRoutes: [],
  }),
  actions: {
    generateRoutes(roles) {
      this.addRoutes = asyncRoutes;
      this.routes = constantRoutes.concat(this.addRoutes);
    },
  },
});

export default usePermissionStore;
