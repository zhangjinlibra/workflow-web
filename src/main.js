import { createApp } from "vue";

import App from "./App.vue";
const app = createApp(App);
// app.config.unwrapInjectedRef = true

// 状态机
import pinia from "./stores";
app.use(pinia);

// 路由
import router from "./router";
app.use(router);

// arco
// 完整引入
// import ArcoVue from "@arco-design/web-vue";
// import "@arco-design/web-vue/dist/arco.css";
// app.use(ArcoVue);
// 其他主题
// import "@arco-themes/vue-gi-demo/css/arco.css";
// import "@arco-themes/vue-digitforce/css/arco.css";
// 按需加载，下面的组件样式需手动引入
import "@arco-design/web-vue/es/message/style/css";
import "@arco-design/web-vue/es/modal/style/css";
import "@arco-design/web-vue/es/notification/style/css";

// arco图标库
// import ArcoVueIcon from "@arco-design/web-vue/es/icon";
// app.use(ArcoVueIcon);

// 拖拽滚动组件
import Vue3Dragscroll from "vue3-dragscroll";
app.use(Vue3Dragscroll);

// 流程组件
import AddNode from "@/components/flow/AddNode.vue";
import NodeWrap from "@/components/flow/NodeWrap.vue";
app.component("AddNode", AddNode);
app.component("NodeWrap", NodeWrap);

// svg-icon
import SvgIcon from "@/components/SvgIcon/index.vue";
import "virtual:svg-icons-register";
app.component("SvgIcon", SvgIcon);

// 指令
import vFocus from "./directive/focus";
import vLoading from "./directive/loading";
app.directive("focus", vFocus);
app.directive("loading", vLoading);

// 全局样式
import "@/styles/index.less";

// 权限
import "@/permission";

// 挂载组件
app.mount("#app");

// 加载开发环境
import "@/dev";
