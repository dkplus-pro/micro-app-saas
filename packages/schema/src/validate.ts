import { isSupportedModule, isSupportedPage } from './module-registry.ts';
import { isModuleCapabilityEnabled, normalizeTenantPages, tenantPagesToRecord } from './normalize.ts';
import type { PageKey, TenantPage, TenantSchema } from './types.ts';

export class SchemaValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Tenant schema validation failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'SchemaValidationError';
    this.issues = issues;
  }
}

export function validateTenantSchema(input: unknown): TenantSchema {
  const result = validateTenantSchemaResult(input);
  if (!result.valid) {
    throw new SchemaValidationError(result.errors.map(toStrictCompatibilityIssue));
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

  if (!isObject(schema.pages) && !Array.isArray(schema.pages)) {
    issues.push('pages must be an object map or an array');
  }

  const enabledRoutes = new Set<string>();
  const enabledPages = new Set<PageKey>();
  const pageEntries = pageEntriesForValidation(schema.pages, issues);
  const pages = tenantPagesToRecord(schema.pages);

  for (const [pageKey, page] of pageEntries) {
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
      if (!isModuleCapabilityEnabled(schema, moduleConfig.key)) {
        issues.push(`pages.${pageKey}.modules references disabled capability ${pascalFeature}`);
      }
    }
  }

  for (const tab of schema.tabs ?? []) {
    assertString(tab?.key, 'tabs[].key', issues);
    assertString(tab?.text, 'tabs[].text', issues);
    if (!isSupportedPage(String(tab?.page))) {
      issues.push(`tabs[].page ${String(tab?.page)} is not supported`);
    } else if (!pages[tab.page]) {
      issues.push(`tabs[].page ${tab.page} must reference an existing page`);
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

function toStrictCompatibilityIssue(issue: string): string {
  const unknownModule = issue.match(/^(.*\.modules) references unknown module (.+)$/);
  if (unknownModule) return `${unknownModule[1]} references unsupported module ${unknownModule[2]}`;

  const disabledTab = issue.match(/^tab (.+) points to disabled page (.+)$/);
  if (disabledTab) return `tabs[].page ${disabledTab[2]} must reference an enabled page`;

  const missingTab = issue.match(/^tab (.+) points to missing page (.+)$/);
  if (missingTab) return `tabs[].page ${missingTab[2]} must reference an enabled page`;

  return issue;
}


function pageEntriesForValidation(pages: TenantSchema['pages'], issues: string[]): Array<[PageKey, TenantPage]> {
  if (!isObject(pages) && !Array.isArray(pages)) return [];
  const entries = normalizeTenantPages(pages);
  const seen = new Set<string>();
  for (const [pageKey] of entries) {
    if (seen.has(pageKey)) issues.push(`pages contains duplicate page key ${pageKey}`);
    seen.add(pageKey);
  }
  return entries;
}
