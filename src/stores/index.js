import { createPinia } from "pinia";
import useUserStore from "./modules/user";
import useFlowStore from "./modules/flow";
import useOrganStore from "./modules/organ";
import usePermissionStore from "./modules/permission";
import useAppStore from "./modules/app";

const pinia = createPinia();

export { useUserStore, useOrganStore, useFlowStore, usePermissionStore, useAppStore };
export default pinia;
