import type { ModuleKey } from './types.ts';

export const MODULE_REGISTRY = ['module-a', 'module-b', 'module-c', 'module-d', 'module-e'] as const satisfies readonly ModuleKey[];
export const MODULE_REGISTRY_SET = new Set<string>(MODULE_REGISTRY);
export const PAGE_ROUTE_PATTERN = /^pages\/[a-z0-9-]+\/index$/;

export function featureKeyForModule(moduleKey: ModuleKey): string {
  return moduleKey.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
