import { MODULE_REGISTRY_SET, PAGE_ROUTE_PATTERN, featureKeyForModule } from './registry.ts';
import type { ModuleKey, TenantSchema, ValidationResult } from './types.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateTenantSchema(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { valid: false, errors: ['schema must be an object'] };

  const schema = input as TenantSchema;
  const tenant = isRecord(schema.tenant) ? schema.tenant : {};
  const app = isRecord(schema.app) ? schema.app : {};
  if (!hasText(tenant.tenantId)) errors.push('tenant.tenantId is required');
  if (!hasText(tenant.tenantName)) errors.push('tenant.tenantName is required');
  if (!hasText(app.appKey)) errors.push('app.appKey is required');
  if (!hasText(app.appid)) errors.push('app.appid is required');
  if (!hasText(app.name)) errors.push('app.name is required');

  const pages = isRecord(schema.pages) ? schema.pages : {};
  if (!isRecord(schema.pages)) errors.push('pages must be an object');
  const tabs = Array.isArray(schema.tabs) ? schema.tabs : [];
  const features = isRecord(schema.features) ? schema.features : {};
  if (!isRecord(schema.features)) errors.push('features must be an object');
  const enabledRoutes = new Set<string>();
  const allRoutes = new Set<string>();
  const tabPageKeys = new Set<string>(tabs.filter(isRecord).map((tab) => String(tab.page)));

  for (const [pageKey, page] of Object.entries(pages)) {
    if (!isRecord(page)) {
      errors.push(`${pageKey} must be an object`);
      continue;
    }
    const route = typeof page.route === 'string' ? page.route : '';
    const packageValue = typeof page.package === 'string' ? page.package : undefined;
    const subPackageRoot = typeof page.subPackageRoot === 'string' ? page.subPackageRoot : undefined;
    if (!PAGE_ROUTE_PATTERN.test(route)) errors.push(`${pageKey}.route must match pages/<page>/index`);
    if (allRoutes.has(route)) errors.push(`${pageKey}.route duplicates ${route}`);
    allRoutes.add(route);
    const isTabPage = tabPageKeys.has(pageKey);
    const packageType = getDefaultPackageType(route, isTabPage, packageValue);
    if (packageType !== 'main' && packageType !== 'subPackage') errors.push(`${pageKey}.package must be main or subPackage`);
    if (packageType === 'main' && subPackageRoot) errors.push(`${pageKey}.subPackageRoot is only valid for subPackage pages`);
    if (subPackageRoot && !/^pages\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(subPackageRoot)) {
      errors.push(`${pageKey}.subPackageRoot must match pages/<subpackage-root>`);
    }
    if (typeof page.enabled !== 'boolean') errors.push(`${pageKey}.enabled must be boolean`);
    if (page.enabled) {
      enabledRoutes.add(route);
      if (route !== 'pages/page-a/index' && !isTabPage && packageType !== 'subPackage') {
        errors.push(`${pageKey}.package must be subPackage for non-tab pages`);
      }
      if ((route === 'pages/page-a/index' || isTabPage) && packageType !== 'main') {
        errors.push(`${pageKey}.package must be main for home/tab pages`);
      }
    }
    if (page.enabled && !hasText(page.title)) errors.push(`${pageKey}.title is required for enabled page`);

    const seenModules = new Set<string>();
    const modules = page.modules === undefined ? [] : Array.isArray(page.modules) ? page.modules : undefined;
    if (!modules) {
      errors.push(`${pageKey}.modules must be an array`);
      continue;
    }
    for (const moduleRef of modules) {
      if (!isRecord(moduleRef)) {
        errors.push(`${pageKey}.modules entries must be objects`);
        continue;
      }
      const moduleKey = String(moduleRef.key);
      if (!MODULE_REGISTRY_SET.has(moduleKey)) errors.push(`${pageKey}.modules references unknown module ${moduleKey}`);
      if (seenModules.has(moduleKey)) errors.push(`${pageKey}.modules contains duplicate module ${moduleKey}`);
      seenModules.add(moduleKey);
      const featureKey = featureKeyForModule(moduleKey as ModuleKey);
      if (features[featureKey] === false) errors.push(`${pageKey}.modules references disabled feature ${featureKey}`);
    }
  }

  if (!Array.isArray(schema.tabs) || tabs.length < 1 || tabs.length > 5) {
    errors.push('tabs must contain 1 to 5 items');
  }
  for (const tab of tabs) {
    if (!isRecord(tab)) {
      errors.push('tabs entries must be objects');
      continue;
    }
    const tabKey = String(tab.key);
    const tabPage = String(tab.page);
    const target = pages[tabPage];
    if (!target) errors.push(`tab ${tabKey} points to missing page ${tabPage}`);
    if (isRecord(target) && !target.enabled) errors.push(`tab ${tabKey} points to disabled page ${tabPage}`);
    const targetRoute = isRecord(target) && typeof target.route === 'string' ? target.route : '';
    if (isRecord(target) && !enabledRoutes.has(targetRoute)) errors.push(`tab ${tabKey} route ${targetRoute} is not enabled`);
    const targetPackage = isRecord(target) && typeof target.package === 'string' ? target.package : undefined;
    if (isRecord(target) && getDefaultPackageType(targetRoute, true, targetPackage) === 'subPackage') {
      errors.push(`tab ${tab.key} points to subPackage page ${tab.page}`);
    }
    if (!hasText(tab.text)) errors.push(`tab ${tabKey} text is required`);
  }

  const runtime = isRecord(schema.runtime) ? schema.runtime : undefined;
  const assets = isRecord(runtime?.assets) ? runtime.assets : undefined;
  validateImageAsset('runtime.assets.pageAImage', assets?.pageAImage, errors);

  return { valid: errors.length === 0, errors };
}

export function assertValidTenantSchema(schema: TenantSchema): void {
  const result = validateTenantSchema(schema);
  if (!result.valid) throw new Error(`Invalid tenant schema ${schemaTenantId(schema)}:\n- ${result.errors.join('\n- ')}`);
}

function schemaTenantId(schema: unknown): string {
  if (!isRecord(schema) || !isRecord(schema.tenant) || !hasText(schema.tenant.tenantId)) return '<unknown>';
  return schema.tenant.tenantId;
}

function getDefaultPackageType(route: string, isTabPage: boolean, explicitPackage?: string): string {
  return explicitPackage ?? (route === 'pages/page-a/index' || isTabPage ? 'main' : 'subPackage');
}

function validateImageAsset(path: string, value: unknown, errors: string[]): void {
  if (value === undefined) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${path} must be an object`);
    return;
  }
  const asset = value as Record<string, unknown>;
  if (!hasText(asset.src)) {
    errors.push(`${path}.src is required`);
  } else if (!/^assets\/[a-z0-9/_-]+\.(?:png|jpe?g|webp|gif)$/i.test(asset.src)) {
    errors.push(`${path}.src must point to a local assets image`);
  }
  for (const key of ['title', 'description', 'alt']) {
    if (asset[key] !== undefined && typeof asset[key] !== 'string') {
      errors.push(`${path}.${key} must be a string`);
    }
  }
}
