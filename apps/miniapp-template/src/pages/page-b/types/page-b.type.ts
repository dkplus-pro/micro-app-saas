import type { ModuleKey } from "../../../../../../packages/schema/src/index.ts";

export interface PageBModuleViewModel {
  key: ModuleKey;
  displayName: string;
  props: Record<string, unknown>;
}
