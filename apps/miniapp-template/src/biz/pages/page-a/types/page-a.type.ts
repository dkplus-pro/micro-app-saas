import type { ModuleKey } from '../../../../../../../packages/schema/src/types.js';

export interface PageAModuleViewModel {
  key: ModuleKey;
  displayName: string;
  props: Record<string, unknown>;
  order: number;
  navigationUrl?: string;
}
