import { defineStore } from "pinia";
import Cookies from "js-cookie";
import { isObject } from "@/utils/is";
import settings from "@/settings";

const useAppStore = defineStore("app", {
  state: () => ({
    title: settings.title,
    fixedHeader: settings.fixedHeader,
    sidebarLogo: settings.sidebarLogo,
    sidebar: {
      opened: Cookies.get("sidebarStatus") ? !!+Cookies.get("sidebarStatus") : true,
      withoutAnimation: false,
    },
    device: "desktop",
  }),
  getters: {
    get: (state) => {
      return { ...state };
    },
  },
  actions: {
    changeSetting(data) {
      if (data && isObject(data)) {
        for (let key in data) {
          if (Object.prototype.hasOwnProperty.call(this, key)) {
            this[key] = data[key];
          }
        }
      }
    },
    toggleSideBar() {
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = false;
      if (this.sidebar.opened) {
        Cookies.set("sidebarStatus", 1);
      } else {
        Cookies.set("sidebarStatus", 0);
      }
    },
    closeSideBar({ withoutAnimation }) {
      Cookies.set("sidebarStatus", 0);
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation;
    },
    toggleDevice(device) {
      this.device = device;
    },
  },
});

export default useAppStore;
