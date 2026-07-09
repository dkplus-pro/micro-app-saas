import type { ModuleKey, PageKey, TenantPage, UniAppPackageType } from './types.ts';

export type PageLayout = NonNullable<TenantPage['layout']>;

export interface SystemModuleRegistryEntry {
  key: ModuleKey;
  name: string;
  entryImportPath: string;
  componentImportPath: string;
  capabilities: readonly string[];
  stores: readonly string[];
  allowedLayouts: readonly PageLayout[];
  assets: readonly string[];
  renderLabel: string;
}

export interface SystemPageRegistryEntry {
  key: PageKey;
  route: TenantPage['route'];
  componentImportPath: string;
  defaultPackage: UniAppPackageType;
  supportedLayouts: readonly PageLayout[];
}

export type SystemModuleRegistry = Readonly<Record<ModuleKey, SystemModuleRegistryEntry>>;
export type SystemPageRegistry = Readonly<Record<PageKey, SystemPageRegistryEntry>>;

export const MODULE_REGISTRY = ['module-a', 'module-b', 'module-c', 'module-d', 'module-e'] as const satisfies readonly ModuleKey[];
export const MODULE_REGISTRY_SET = new Set<string>(MODULE_REGISTRY);
export const PAGE_REGISTRY = ['page-a', 'page-b', 'page-c', 'page-d'] as const satisfies readonly PageKey[];
export const PAGE_REGISTRY_SET = new Set<string>(PAGE_REGISTRY);
export const PAGE_ROUTE_PATTERN = /^pages\/[a-z0-9-]+\/index$/;

export const SYSTEM_MODULE_REGISTRY = {
  'module-a': moduleRegistryEntry('module-a', '模块A', {
    capabilities: ['enableAiChat'],
    stores: ['moduleAStore'],
    assets: ['module-a-banner']
  }),
  'module-b': moduleRegistryEntry('module-b', '模块B'),
  'module-c': moduleRegistryEntry('module-c', '模块C'),
  'module-d': moduleRegistryEntry('module-d', '模块D'),
  'module-e': moduleRegistryEntry('module-e', '模块E')
} as const satisfies SystemModuleRegistry;

export const SYSTEM_PAGE_REGISTRY = {
  'page-a': pageRegistryEntry('page-a', 'pages/page-a/index', 'main', ['standard']),
  'page-b': pageRegistryEntry('page-b', 'pages/page-b/index', 'main', ['stream', 'standard']),
  'page-c': pageRegistryEntry('page-c', 'pages/page-c/index', 'main', ['standard']),
  'page-d': pageRegistryEntry('page-d', 'pages/page-d/index', 'subPackage', ['standard'])
} as const satisfies SystemPageRegistry;

export function featureKeyForModule(moduleKey: ModuleKey): string {
  return moduleKey.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function resolveModuleRegistryEntry(
  moduleKey: ModuleKey,
  registry: SystemModuleRegistry = SYSTEM_MODULE_REGISTRY
): SystemModuleRegistryEntry {
  const entry = registry[moduleKey];
  if (!entry) throw new Error(`Missing registry entry for module ${moduleKey}`);
  return entry;
}

export function resolvePageRegistryEntry(
  pageKey: PageKey,
  registry: SystemPageRegistry = SYSTEM_PAGE_REGISTRY
): SystemPageRegistryEntry {
  const entry = registry[pageKey];
  if (!entry) throw new Error(`Missing registry entry for page ${pageKey}`);
  return entry;
}

function moduleRegistryEntry(
  key: ModuleKey,
  name: string,
  overrides: Partial<Omit<SystemModuleRegistryEntry, 'key' | 'name' | 'entryImportPath' | 'componentImportPath' | 'renderLabel'>> = {}
): SystemModuleRegistryEntry {
  return {
    key,
    name,
    entryImportPath: `../modules/${key}/index.js`,
    componentImportPath: `../modules/${key}/index.vue`,
    capabilities: overrides.capabilities ?? [],
    stores: overrides.stores ?? [],
    allowedLayouts: overrides.allowedLayouts ?? ['stream', 'standard'],
    assets: overrides.assets ?? [],
    renderLabel: key
  };
}

function pageRegistryEntry(
  key: PageKey,
  route: TenantPage['route'],
  defaultPackage: UniAppPackageType,
  supportedLayouts: readonly PageLayout[]
): SystemPageRegistryEntry {
  return {
    key,
    route,
    componentImportPath: `../pages/${key}/index.vue`,
    defaultPackage,
    supportedLayouts
  };
}
