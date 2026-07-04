import { isSupportedModule, isSupportedPage } from './module-registry.ts';
import type { PageKey, TenantSchema } from './types.ts';

export class SchemaValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Tenant schema validation failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'SchemaValidationError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, path: string, issues: string[]): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push(`${path} is required`);
  }
}

export function validateTenantSchema(input: unknown): TenantSchema {
  const issues: string[] = [];
  if (!isObject(input)) {
    throw new SchemaValidationError(['schema must be an object']);
  }

  const schema = input as unknown as TenantSchema;
  assertString(schema.tenant?.tenantId, 'tenant.tenantId', issues);
  assertString(schema.tenant?.tenantName, 'tenant.tenantName', issues);
  assertString(schema.app?.appKey, 'app.appKey', issues);
  assertString(schema.app?.appid, 'app.appid', issues);
  assertString(schema.app?.name, 'app.name', issues);

  if (!Array.isArray(schema.tabs) || schema.tabs.length < 2 || schema.tabs.length > 5) {
    issues.push('tabs must contain 2 to 5 items');
  }

  if (!isObject(schema.pages)) {
    issues.push('pages must be an object');
  }

  const enabledRoutes = new Set<string>();
  const enabledPages = new Set<PageKey>();

  for (const [pageKey, page] of Object.entries(schema.pages ?? {})) {
    if (!isSupportedPage(pageKey)) {
      issues.push(`pages.${pageKey} is not supported`);
      continue;
    }
    if (!page || typeof page !== 'object') {
      issues.push(`pages.${pageKey} must be an object`);
      continue;
    }
    assertString(page.route, `pages.${pageKey}.route`, issues);
    assertString(page.title, `pages.${pageKey}.title`, issues);
    if (typeof page.enabled !== 'boolean') {
      issues.push(`pages.${pageKey}.enabled must be boolean`);
    }
    if (page.route && !/^pages\/[a-z0-9-]+\/index$/.test(page.route)) {
      issues.push(`pages.${pageKey}.route must match pages/<page>/index`);
    }
    if (page.enabled) {
      if (enabledRoutes.has(page.route)) {
        issues.push(`duplicate enabled route ${page.route}`);
      }
      enabledRoutes.add(page.route);
      enabledPages.add(pageKey);
    }

    const seenModules = new Set<string>();
    for (const moduleConfig of page.modules ?? []) {
      if (!isSupportedModule(String(moduleConfig.key))) {
        issues.push(`pages.${pageKey}.modules references unsupported module ${String(moduleConfig.key)}`);
        continue;
      }
      if (seenModules.has(moduleConfig.key)) {
        issues.push(`pages.${pageKey}.modules contains duplicate module ${moduleConfig.key}`);
      }
      seenModules.add(moduleConfig.key);
      const featureKey = moduleConfig.key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const camelFeature = featureKey.replace(/^module/, 'module');
      const pascalFeature = camelFeature.charAt(0).toLowerCase() + camelFeature.slice(1);
      if (schema.features && schema.features[pascalFeature] === false) {
        issues.push(`pages.${pageKey}.modules references disabled feature ${pascalFeature}`);
      }
    }
  }

  for (const tab of schema.tabs ?? []) {
    assertString(tab?.key, 'tabs[].key', issues);
    assertString(tab?.text, 'tabs[].text', issues);
    if (!isSupportedPage(String(tab?.page))) {
      issues.push(`tabs[].page ${String(tab?.page)} is not supported`);
    } else if (!enabledPages.has(tab.page)) {
      issues.push(`tabs[].page ${tab.page} must reference an enabled page`);
    }
  }

  validateImageAsset('runtime.assets.pageAImage', schema.runtime?.assets?.pageAImage, issues);

  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }
  return schema;
}

function validateImageAsset(path: string, value: unknown, issues: string[]): void {
  if (value === undefined) return;
  if (!isObject(value)) {
    issues.push(`${path} must be an object`);
    return;
  }
  assertString(value.src, `${path}.src`, issues);
  if (typeof value.src === 'string' && !/^assets\/[a-z0-9/_-]+\.(?:png|jpe?g|webp|gif)$/i.test(value.src)) {
    issues.push(`${path}.src must point to a local assets image`);
  }
  for (const key of ['title', 'description', 'alt']) {
    if (value[key] !== undefined && typeof value[key] !== 'string') {
      issues.push(`${path}.${key} must be a string`);
    }
  }
}
