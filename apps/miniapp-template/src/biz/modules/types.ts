import type { ModuleKey } from '../../../../../packages/schema/src/types.js';

export interface ModuleAdapter {
  key: ModuleKey;
  title: string;
  render(): string;
}
