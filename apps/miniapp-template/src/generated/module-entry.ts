import * as module0 from "../modules/module-a/index.ts";
import * as module1 from "../modules/module-d/index.ts";
import * as module2 from "../modules/module-c/index.ts";

export const tenantModules = [
  { key: "module-a", displayName: "Module A", props: {}, module: module0 },
  { key: "module-d", displayName: "Module D", props: {}, module: module1 },
  { key: "module-c", displayName: "Module C", props: {}, module: module2 }
] as const;

export type TenantModuleKey = typeof tenantModules[number]["key"];
