import router from "./router";
import { usePermissionStore } from "@/stores";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = []; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();
  // console.log("to", to);
  // console.log("from", from);

  // set page title
  document.title = getPageTitle(to.meta.title);

  let { generateRoutes } = usePermissionStore();
  generateRoutes();

  // determine whether the user has logged in
  const hasToken = getToken();

  if (hasToken) {
    next();
    NProgress.done();
  } else {
    /* has no token*/
    next();
    NProgress.done();
  }
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});
