import type { ModuleKey, PageKey } from './types.ts';
import { MODULE_REGISTRY, PAGE_REGISTRY } from './registry.ts';

export const SUPPORTED_MODULES = MODULE_REGISTRY;
export const SUPPORTED_PAGES = PAGE_REGISTRY;

export function isSupportedModule(value: string): value is ModuleKey {
  return (SUPPORTED_MODULES as readonly string[]).includes(value);
}

export function isSupportedPage(value: string): value is PageKey {
  return (SUPPORTED_PAGES as readonly string[]).includes(value);
}
