<template>
  <section class="app-container">
    <header class="app-header-container">
      <div class="app-header-box">
        <div class="left-side">
          <a-space>
            <div class="logo"><img alt="Vue logo" class="logo" src="@/assets/logo.png" height="24" /></div>
            <!-- <div class="slogan">审批</div> -->
            <a-trigger trigger="hover" position="bottom" :show-arrow="false" :popup-translate="[0, 10]" animation-name="uido">
              <a-tag class="version">20231114.01版本</a-tag>
              <template #content>
                <div class="change-log-list">
                  <div class="change-log">
                    <div class="version-title">本次更新</div>
                    <a-divider />
                    <div class="version-content">
                      <p>
                        新增：审批表单编辑权限、编辑和编辑记录
                        <a href="https://gitee.com/zhangjinlibra/workflow-engine/issues/I8C9HT" target="_blank">#I8C9HT</a>
                      </p>
                      <p>修复已知问题, 优化体验</p>
                    </div>
                  </div>
                </div>
              </template>
            </a-trigger>
          </a-space>
        </div>
        <ul class="right-side">
          <li>
            <a-button type="outline" shape="circle" class="nav-btn" disabled>
              <icon-notification />
            </a-button>
          </li>
          <li>
            <a-tooltip content="Star 一下">
              <a-button type="outline" shape="circle" class="nav-btn" @click="onGiteeClicked()">
                <img src="https://gitee.com/static/images/logo-en.svg" style="width: 32px; height: 32px" />
              </a-button>
            </a-tooltip>
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
                    <a-doption disabled>
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

    <div class="app-main-content-container">
      <div class="sidebar-container" :style="{ width: sidebarWidth }">
        <a-menu
          :style="{ width: sidebarWidth, height: '100%' }"
          :accordion="true"
          :level-indent="34"
          :collapsed="!sidebarOpened"
          :collapsed-width="sidebarCollapsedWidth"
          :auto-open-selected="true"
          :default-selected-keys="[selectedMenu]"
          :selected-keys="[selectedMenu]"
          :default-open-keys="['/']"
          @menu-item-click="onMenuItemClick">
          <template v-for="route in filteredRoutes">
            <MenuItem :item="route" :is-nest="false"></MenuItem>
          </template>
        </a-menu>

        <a-button class="menu-collapse-button" @click="onCollapsed">
          <icon-double-left v-if="sidebarOpened" />
          <icon-double-right v-else />
        </a-button>
      </div>
      <section class="main-container">
        <div class="breadcrumb-container">
          <a-breadcrumb>
            <a-breadcrumb-item v-for="(item, idx) in breadcrumbList" :key="item.path">
              <span v-if="idx === breadcrumbList.length - 1" class="no-redirect">{{ item.meta.title }}</span>
              <span v-else class="redirect">{{ item.meta.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
          <!-- <transition-group name="breadcrumb"> </transition-group> -->
        </div>

        <div class="content-container">
          <router-view v-slot="{ Component, route }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" :key="route.path" />
            </transition>
          </router-view>
        </div>
      </section>
    </div>

    <!-- 切换用户 -->
    <switch-user v-model:visible="showSwitchUserModal"></switch-user>
  </section>
</template>

<script setup>
import { getLoginUserDetail } from "@/api/OrganApi";
import { useAppStore, usePermissionStore, useUserStore } from "@/stores";
import lessVars from "@/styles/variables.module.less";
import SwitchUser from "@/views/user/SwitchUser.vue";
import { IconDoubleLeft, IconDoubleRight, IconExport, IconNotification, IconUser, IconUserGroup } from "@arco-design/web-vue/es/icon";
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MenuItem from "./MenuItem.vue";

const route = useRoute();
const router = useRouter();
let { routes } = usePermissionStore();
let { setLoginUser } = useUserStore();
let { sidebar, closeSideBar, toggleDevice, toggleSideBar } = useAppStore();
const { body } = document;

let userDetail = ref({});

const getSidebarWidth = () => (sidebar.opened ? lessVars.AppSidebarWidth : lessVars.AppSidebarCollapsedWidth);
let sidebarWidth = ref(getSidebarWidth());
let sidebarCollapsedWidth = ref(Number.parseInt(lessVars.AppSidebarCollapsedWidth.replace("px", "")));
// let selectedMenu = computed(() => route.path);
let selectedMenu = ref(route.path);
let breadcrumbList = computed(() => route.matched.filter((item) => item.meta && item.meta.title));

// 菜单
let filteredRoutes = computed(() => {
  return routes;
});

// 监听路由变化, 设置菜单选中
watch(
  () => router.currentRoute.value.path,
  (nv, ov) => (selectedMenu.value = nv)
);

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
  showSwitchUserModal.value = true;
};
</script>

<style lang="less" scoped>
@import "@/styles/variables.module.less";

.app-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.app-header-container {
  width: 100%;
  height: @AppHeaderHeight;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  // box-shadow: 0px 0px 8px var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.app-main-content-container {
  display: flex;
  height: calc(100% - @AppHeaderHeight);
  background-color: @MainContentBg;
}

.sidebar-container {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08);
  transition: width 0.3s;
  user-select: none;

  .menu-collapse-button {
    @BtnSize: 30px;
    position: absolute;
    right: calc((@AppSidebarCollapsedWidth - @BtnSize) / 2);
    bottom: calc((@AppSidebarCollapsedWidth - @BtnSize) / 2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: @BtnSize;
    height: @BtnSize;
    border-radius: var(--border-radius-small);
    cursor: pointer;
    background-color: var(--color-fill-2);
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

.app-header-box {
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
      cursor: pointer;
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

.breadcrumb-container {
  height: @AppBreadcrumbHeight;
  padding: 0 @Gap;
  display: flex;
  align-items: center;
  user-select: none;
}

.content-container {
  height: calc(100% - @AppBreadcrumbHeight);
}

.avatat-menu-content {
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px #00000026;
  padding: 4px;
}

.change-log-list {
  background-color: var(--color-bg-popup);
  border-radius: 4px;
  box-shadow: 0 2px 8px #00000026;

  .change-log {
    .arco-divider {
      margin: 0;
    }

    .version-title {
      padding: 10px 12px;
    }

    .version-content {
      padding: 10px 12px;

      p {
        padding: 0 8px 0 12px;
        line-height: 22px;
        color: #646a73;

        &::before {
          content: "";
          width: 4px;
          height: 4px;
          position: absolute;
          top: 9px;
          left: 0;
          border-radius: 2px;
          background: #3370ff;
        }
      }
    }

    + .change-log {
      border-top: 1px solid var(--color-neutral-2);
    }
  }
}
</style>
