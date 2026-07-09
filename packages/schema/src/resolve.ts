import { normalizeTenantPages } from './normalize.ts';
import {
  resolveModuleRegistryEntry,
  resolvePageRegistryEntry,
  type SystemModuleRegistryEntry,
  type SystemPageRegistryEntry
} from './registry.ts';
import type { ModuleKey, PageKey, TenantModuleRef, TenantPage, TenantSchema } from './types.ts';

export interface ResolvedTenantPage extends TenantPage {
  key: PageKey;
  registry: SystemPageRegistryEntry;
  modules: TenantModuleRef[];
}

export interface ResolvedTenantModule {
  key: ModuleKey;
  registry: SystemModuleRegistryEntry;
  pageKeys: PageKey[];
}

export interface ResolvedTenantRegistry {
  enabledPages: ResolvedTenantPage[];
  modules: ResolvedTenantModule[];
}

export function resolveTenantRegistry(schema: TenantSchema): ResolvedTenantRegistry {
  const enabledPages = normalizeTenantPages(schema.pages)
    .filter(([, page]) => page.enabled)
    .map(([key, page]) => ({
      ...page,
      key,
      registry: resolvePageRegistryEntry(key),
      modules: page.modules ?? []
    }));

  const moduleEntries = new Map<ModuleKey, ResolvedTenantModule>();
  for (const page of enabledPages) {
    for (const moduleRef of page.modules) {
      const entry = moduleEntries.get(moduleRef.key);
      if (entry) {
        if (!entry.pageKeys.includes(page.key)) entry.pageKeys.push(page.key);
        continue;
      }
      moduleEntries.set(moduleRef.key, {
        key: moduleRef.key,
        registry: resolveModuleRegistryEntry(moduleRef.key),
        pageKeys: [page.key]
      });
    }
  }

  return {
    enabledPages,
    modules: [...moduleEntries.values()]
  };
}
