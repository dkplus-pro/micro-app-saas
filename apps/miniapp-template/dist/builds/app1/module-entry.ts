import modulea from '../modules/module-a/index.js';
import moduleb from '../modules/module-b/index.js';
import modulec from '../modules/module-c/index.js';
import moduled from '../modules/module-d/index.js';

export const moduleEntries = {
  'module-a': modulea,
  'module-b': moduleb,
  'module-c': modulec,
  'module-d': moduled,
} as const;

export type GeneratedModuleKey = keyof typeof moduleEntries;
