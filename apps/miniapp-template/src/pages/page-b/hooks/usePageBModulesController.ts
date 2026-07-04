import { tenantModules } from "../../../generated/module-entry.ts";
import { toDisplayModules } from "../utils/module-visible.util.ts";

export function usePageBModulesController() {
  return {
    modules: toDisplayModules(tenantModules)
  };
}
