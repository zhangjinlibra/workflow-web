<template>
  <section class="app-wrapper">
    <header class="header-container">
      <div class="fd-header-box">
        <div class="left-side">
          <a-space>
            <div class="logo"><img alt="Vue logo" class="logo" src="@/assets/logo.png" height="24" /></div>
            <!-- <div class="slogan">审批</div> -->
            <a-tag class="version">20230905.01版本</a-tag>
          </a-space>
        </div>
        <ul class="right-side">
          <li>
            <a-button type="outline" shape="circle" class="nav-btn">
              <icon-notification />
            </a-button>
          </li>
          <li>
            <a-button type="outline" shape="circle" class="nav-btn" @click="onGiteeClicked()">
              <img src="https://gitee.com/static/images/logo-en.svg" style="width: 32px; height: 32px" />
            </a-button>
          </li>
          <li>
            <div class="avatar">
              <!-- <a-dropdown position="br"> </a-dropdown> -->
              <a-trigger trigger="click" position="br" :show-arrow="false" :popup-translate="[0, 10]" animation-name="uido">
                <a-avatar :size="32" :image-url="userDetail.avatar" v-if="userDetail.avatar" />
                <a-avatar :size="32" v-else> <icon-user /> </a-avatar>
                <template #content>
                  <div class="avatat-menu-content">
                    <a-doption @click="onChangeUserClicked()">
                      <template #icon> <icon-user-group :size="16" /> </template>
                      <template #default>切换用户</template>
                    </a-doption>
                    <a-doption>
                      <template #icon> <icon-export :size="16" /> </template>
                      <template #default>退出登录</template>
                    </a-doption>
                  </div>
                </template>
              </a-trigger>
            </div>
          </li>
        </ul>
      </div>
    </header>

    <div class="main-content-container">
      <div class="sidebar-container" :style="{ width: sidebarWidth }">
        <a-menu
          :style="{ width: sidebarWidth, height: '100%' }"
          :collapsed="!sidebarOpened"
          :collapsed-width="sidebarCollapsedWidth"
          :auto-open-selected="true"
          :default-selected-keys="[selectedMenu]"
          :default-open-keys="['/']"
          @menu-item-click="onMenuItemClick">
          <template v-for="route in filteredRoutes">
            <template v-if="route.children && route.children.length > 1">
              <a-sub-menu :key="route.path">
                <template #icon>
                  <span class="icon iconfont-approval-admin" v-html="route.meta.icon"></span>
                </template>
                <template #title>{{ route.meta.title }}</template>
                <a-menu-item :key="sub.path" v-for="sub in route.children">{{ sub.meta.title }}</a-menu-item>
              </a-sub-menu>
            </template>
            <template v-else>
              <a-menu-item :key="route.children[0].path">
                <template #icon>
                  <span class="icon iconfont-approval-admin" v-html="route.meta.icon"></span>
                </template>
                {{ route.meta.title }}
              </a-menu-item>
            </template>
          </template>
        </a-menu>

        <a-button class="menu-collapse-button" @click="onCollapsed">
          <icon-double-left v-if="sidebarOpened" />
          <icon-double-right v-else />
        </a-button>
      </div>
      <section class="main-container">
        <div class="breadcrumb-wrapper">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="(item, idx) in breadcrumbList" :key="item.path">
              <span v-if="idx === breadcrumbList.length - 1" class="no-redirect">{{ item.meta.title }}</span>
              <span v-else class="redirect">{{ item.meta.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
          <!-- <transition-group name="breadcrumb"> </transition-group> -->
        </div>

        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </section>
    </div>

    <!-- 切换用户 -->
    <switch-user v-model:visible="showSwitchUserModal"></switch-user>

    <!-- 计算公式 -->
    <Formula v-model:visible="visible"></Formula>
  </section>
</template>

<script setup>
// 计算公式测试
import Formula from "@/components/flow/dialog/Formula.vue";
let visible = ref(false);
const onAlarmClicked = () => (visible.value = true);

import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore, useAppStore, usePermissionStore } from "@/stores";
import { getLoginUserDetail } from "@/api/OrganApi";
import lessVars from "@/styles/variables.module.less";
import SwitchUser from "@/views/user/SwitchUser.vue";
import { IconNotification, IconUser, IconUserGroup, IconExport, IconDoubleLeft, IconDoubleRight } from "@arco-design/web-vue/es/icon";

let userDetail = ref({});
const route = useRoute();
const router = useRouter();
let { routes } = usePermissionStore();
let { setLoginUser } = useUserStore();
let { sidebar, closeSideBar, toggleDevice, toggleSideBar } = useAppStore();
const { body } = document;

const getSidebarWidth = () => (sidebar.opened ? lessVars.SidebarWidth : lessVars.SidebarCollapsedWidth);
let sidebarWidth = ref(getSidebarWidth());
let sidebarCollapsedWidth = ref(Number.parseInt(lessVars.SidebarCollapsedWidth.replace("px", "")));
let selectedMenu = computed(() => route.path);
let breadcrumbList = computed(() => route.matched.filter((item) => item.meta && item.meta.title));

// 菜单
let filteredRoutes = computed(() => {
  let newRoutes = JSON.parse(JSON.stringify(routes));
  return newRoutes.filter((route) => {
    roamChildren(route, route.children);
    return !route.hidden;
  });
});
// 遍历菜单子路由，全部转换为绝对路径
const roamChildren = (parent, children) => {
  let prefix = parent.path === "/" ? "" : parent.path;
  (children || []).forEach((child) => {
    if (!child.path.startsWith("/")) child.path = `${prefix}/${child.path}`;
    roamChildren(child, child.children);
  });
};

let sidebarOpened = computed(() => sidebar.opened);

const onMenuItemClick = (key) => {
  // console.log(key);
  router.push(key);
};

const loadUserDetail = () => {
  getLoginUserDetail().then((resp) => {
    let user = resp.data || {};
    userDetail.value = user;
    setLoginUser(user);
  });
};

const onGiteeClicked = () => {
  window.open("https://gitee.com/zhangjinlibra/beeflow-engine");
};

// 侧边栏
const onCollapsed = () => {
  toggleSideBar();
};

watch(sidebar, () => {
  sidebarWidth.value = getSidebarWidth();
});

const WIDTH = ref(992);
const $_isMobile = () => {
  const rect = body.getBoundingClientRect();
  return rect.width - 1 < WIDTH.value;
};
const onResizeHandler = () => {
  if (!document.hidden) {
    const isMobile = $_isMobile();
    toggleDevice(isMobile ? "mobile" : "desktop");
    if (isMobile) closeSideBar({ withoutAnimation: false });
  }
};

onMounted(() => {
  const isMobile = $_isMobile();
  if (isMobile) {
    toggleDevice("mobile");
    closeSideBar({ withoutAnimation: false });
  }
});

onBeforeMount(() => {
  window.addEventListener("resize", onResizeHandler);
  loadUserDetail();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResizeHandler);
});

// 临时
// 切换用户
let showSwitchUserModal = ref(false);
const onChangeUserClicked = () => {
  console.log("onChangeUserClicked");
  showSwitchUserModal.value = true;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.header-container {
  width: 100%;
  height: @HeaderHeight;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  // box-shadow: 0px 0px 8px var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.main-content-container {
  display: flex;
  height: calc(100% - @HeaderHeight);
  background-color: @MainContentBg;
}

.sidebar-container {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08);
  // transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  transition: width 0.3s;
  user-select: none;

  .iconfont-approval-admin {
    font-size: 24px;
  }

  .arco-menu {
    transition: width 0.2s;
  }

  .menu-collapse-button {
    position: absolute;
    right: 15px;
    bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    background-color: var(--color-fill-1);
    color: var(--color-text-1);
    padding: 0;

    &:hover {
      background-color: var(--color-fill-3);
    }
  }
}

.main-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  // background-color: var(--color-fill-2);
  // transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
}

.fd-header-box {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;

  .nav-btn {
    border-color: rgb(var(--gray-3));
    color: rgb(var(--gray-8));
    font-size: 16px;

    &:hover {
      border-color: var(--color-fill-4);
      color: rgb(var(--gray-8));
    }
  }

  .left-side {
    .slogan {
      color: var(--color-text-1);
      font-size: 18px;
      font-weight: 350;
    }

    .version {
      margin-left: 10px;
    }
  }

  .right-side {
    display: flex;
    align-items: center;
    list-style: none;

    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    .avatar {
      cursor: pointer;
    }
  }
}

.breadcrumb-wrapper {
  height: @BreadcrumbHeight;
  padding: 0 @ContentPadding;
  display: flex;
  align-items: center;
  user-select: none;
}

.avatat-menu-content {
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px #00000026;
  padding: 4px;
}
</style>
