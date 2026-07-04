import { moduleAAdapter } from '../modules/module-a/index.js';
import { moduleBAdapter } from '../modules/module-b/index.js';
import { moduleCAdapter } from '../modules/module-c/index.js';
import { moduleDAdapter } from '../modules/module-d/index.js';

import type { ModuleKey } from '../../../../packages/schema/src/types.js';
import type { ModuleAdapter } from '../modules/types.js';

export const enabledModuleKeys = [
  'module-a',
  'module-b',
  'module-c',
  'module-d'
] as const satisfies readonly ModuleKey[];

export const moduleRegistry = {
  'module-a': moduleAAdapter,
  'module-b': moduleBAdapter,
  'module-c': moduleCAdapter,
  'module-d': moduleDAdapter
} satisfies Partial<Record<ModuleKey, ModuleAdapter>>;
