import { MAX_TAB_BAR_ITEMS, MIN_TAB_BAR_ITEMS, MODULE_REGISTRY, PAGE_REGISTRY } from "./registry.ts";
import type { ModuleKey, PageKey, TenantModuleRef, TenantSchema } from "./types.ts";

export class SchemaValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super(`Tenant schema validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
    this.name = "SchemaValidationError";
    this.errors = errors;
  }
}

const ROUTE_RE = /^pages\/[a-z0-9-]+\/index$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushMissing(errors: string[], path: string, value: unknown): void {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${path} is required`);
  }
}

function validateModuleRefs(errors: string[], pageKey: PageKey, modules: TenantModuleRef[] | undefined, features: Record<string, boolean>): void {
  if (!modules) return;
  const seen = new Set<string>();
  for (const moduleRef of modules) {
    const moduleKey = moduleRef.key;
    if (!MODULE_REGISTRY[moduleKey]) {
      errors.push(`pages.${pageKey}.modules references unknown module ${moduleKey}`);
    }
    if (seen.has(moduleKey)) {
      errors.push(`pages.${pageKey}.modules contains duplicate module ${moduleKey}`);
    }
    seen.add(moduleKey);
    const featureKey = moduleKey.replace(/^module-/, "module").replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
    if (features[featureKey] === false) {
      errors.push(`pages.${pageKey}.modules references disabled feature ${featureKey}`);
    }
  }
}

export function assertTenantSchema(value: unknown): asserts value is TenantSchema {
  const errors: string[] = [];
  if (!isRecord(value)) {
    throw new SchemaValidationError(["schema root must be an object"]);
  }

  const schema = value as TenantSchema;
  pushMissing(errors, "tenant.tenantId", schema.tenant?.tenantId);
  pushMissing(errors, "tenant.tenantName", schema.tenant?.tenantName);
  pushMissing(errors, "app.appKey", schema.app?.appKey);
  pushMissing(errors, "app.appid", schema.app?.appid);
  pushMissing(errors, "app.name", schema.app?.name);

  if (!Array.isArray(schema.tabs)) {
    errors.push("tabs must be an array");
  } else if (schema.tabs.length < MIN_TAB_BAR_ITEMS || schema.tabs.length > MAX_TAB_BAR_ITEMS) {
    errors.push(`tabs length must be between ${MIN_TAB_BAR_ITEMS} and ${MAX_TAB_BAR_ITEMS}`);
  }

  if (!isRecord(schema.pages)) {
    errors.push("pages must be an object");
  }

  const features = schema.features ?? {};
  const seenRoutes = new Set<string>();
  const pages = isRecord(schema.pages) ? schema.pages : {};
  for (const [pageKey, page] of Object.entries(pages) as [PageKey, TenantSchema["pages"][PageKey]][]) {
    if (!PAGE_REGISTRY[pageKey]) {
      errors.push(`pages contains unknown page ${pageKey}`);
    }
    if (!page.enabled) {
      errors.push(`pages.${pageKey}.enabled must be true for listed build-time pages`);
    }
    pushMissing(errors, `pages.${pageKey}.title`, page.title);
    if (!ROUTE_RE.test(page.route)) {
      errors.push(`pages.${pageKey}.route must match ${ROUTE_RE}`);
    }
    if (seenRoutes.has(page.route)) {
      errors.push(`route ${page.route} is duplicated`);
    }
    seenRoutes.add(page.route);
    validateModuleRefs(errors, pageKey, page.modules, features);
  }

  if (Array.isArray(schema.tabs)) {
    const seenTabs = new Set<string>();
    for (const [index, tab] of schema.tabs.entries()) {
      pushMissing(errors, `tabs[${index}].key`, tab.key);
      pushMissing(errors, `tabs[${index}].text`, tab.text);
      if (!pages[tab.page]) {
        errors.push(`tabs[${index}].page references missing page ${tab.page}`);
      }
      if (seenTabs.has(tab.page)) {
        errors.push(`tabs contains duplicate page ${tab.page}`);
      }
      seenTabs.add(tab.page);
    }
  }

  if (errors.length > 0) {
    throw new SchemaValidationError(errors);
  }
}

export function validateTenantSchema(schema: unknown): TenantSchema {
  assertTenantSchema(schema);
  return schema;
}
