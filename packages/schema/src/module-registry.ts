import type { ModuleKey, PageKey } from './types.ts';

export const SUPPORTED_MODULES = ['module-a', 'module-b', 'module-c', 'module-d', 'module-e'] as const satisfies readonly ModuleKey[];
export const SUPPORTED_PAGES = ['page-a', 'page-b', 'page-c', 'page-d'] as const satisfies readonly PageKey[];

export function isSupportedModule(value: string): value is ModuleKey {
  return (SUPPORTED_MODULES as readonly string[]).includes(value);
}

export function isSupportedPage(value: string): value is PageKey {
  return (SUPPORTED_PAGES as readonly string[]).includes(value);
}
