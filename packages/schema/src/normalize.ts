import { featureKeyForModule } from './registry.ts';
import type { ModuleFeatureKey, ModuleKey, PageKey, TenantCapabilities, TenantPage, TenantPages, TenantSchema } from './types.ts';

export type TenantPageEntry = [PageKey, TenantPage];

export function normalizeTenantPages(pages: TenantPages | undefined): TenantPageEntry[] {
  if (!pages) return [];
  if (Array.isArray(pages)) return pages.map(({ key, ...page }) => [key, page]);
  return Object.entries(pages) as TenantPageEntry[];
}

export function tenantPagesToRecord(pages: TenantPages | undefined): Partial<Record<PageKey, TenantPage>> {
  return Object.fromEntries(normalizeTenantPages(pages)) as Partial<Record<PageKey, TenantPage>>;
}

export function normalizeTenantCapabilities(schema: Pick<TenantSchema, 'capabilities' | 'features'>): TenantCapabilities {
  return {
    ...(schema.capabilities ?? {}),
    modules: {
      ...legacyModuleCapabilities(schema.features),
      ...(schema.capabilities?.modules ?? {})
    }
  };
}

export function isModuleCapabilityEnabled(schema: Pick<TenantSchema, 'capabilities' | 'features'>, moduleKey: ModuleKey): boolean {
  const capabilities = normalizeTenantCapabilities(schema);
  return capabilities.modules?.[moduleKey] !== false;
}

function legacyModuleCapabilities(features: TenantSchema['features']): Partial<Record<ModuleKey, boolean>> {
  if (!features) return {};
  const moduleKeys: ModuleKey[] = ['module-a', 'module-b', 'module-c', 'module-d', 'module-e'];
  return Object.fromEntries(
    moduleKeys
      .map((moduleKey) => [moduleKey, featureKeyForModule(moduleKey) as ModuleFeatureKey] as const)
      .filter(([, featureKey]) => features[featureKey] !== undefined)
      .map(([moduleKey, featureKey]) => [moduleKey, features[featureKey]])
  ) as Partial<Record<ModuleKey, boolean>>;
}
