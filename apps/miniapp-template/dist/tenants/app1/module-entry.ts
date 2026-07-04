import * as module0 from "../modules/module-a/index";
import * as module1 from "../modules/module-b/index";
import * as module2 from "../modules/module-c/index";
import * as module3 from "../modules/module-d/index";

export const tenantModules = [
  { key: "module-a", displayName: "Module A", props: {}, module: module0 },
  { key: "module-b", displayName: "Module B", props: {}, module: module1 },
  { key: "module-c", displayName: "Module C", props: {}, module: module2 },
  { key: "module-d", displayName: "Module D", props: {}, module: module3 }
] as const;

export type TenantModuleKey = typeof tenantModules[number]["key"];
