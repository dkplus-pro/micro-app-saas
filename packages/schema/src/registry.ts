import type { ModuleKey, PageKey } from "./types.ts";

export const PAGE_REGISTRY = {
  "page-a": "pages/page-a/index",
  "page-b": "pages/page-b/index",
  "page-c": "pages/page-c/index",
  "page-d": "pages/page-d/index"
} as const satisfies Record<PageKey, string>;

export const MODULE_REGISTRY = {
  "module-a": { importPath: "../modules/module-a/index.ts", displayName: "Module A" },
  "module-b": { importPath: "../modules/module-b/index.ts", displayName: "Module B" },
  "module-c": { importPath: "../modules/module-c/index.ts", displayName: "Module C" },
  "module-d": { importPath: "../modules/module-d/index.ts", displayName: "Module D" },
  "module-e": { importPath: "../modules/module-e/index.ts", displayName: "Module E" }
} as const satisfies Record<ModuleKey, { importPath: string; displayName: string }>;

export const MIN_TAB_BAR_ITEMS = 2;
export const MAX_TAB_BAR_ITEMS = 5;
