import type { ModuleKey } from '../../../../../../packages/schema/src/types.js';

export interface PageBModuleConfig {
  key: ModuleKey;
  props?: Record<string, unknown>;
}
