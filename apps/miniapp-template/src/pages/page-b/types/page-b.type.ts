import type { ModuleKey } from "../../../../../../packages/schema/src/index.ts";

export interface PageBModuleViewModel {
  key: ModuleKey;
  props: Record<string, unknown>;
}
