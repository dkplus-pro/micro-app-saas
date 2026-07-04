import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MODULE_REGISTRY, validateTenantSchema } from "../../schema/src/index.ts";
import type { GeneratedModuleEntry, ModuleKey, NormalizedTenantBuild, PageKey, TenantModuleRef, TenantSchema } from "../../schema/src/index.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

export interface GenerateTenantOptions {
  tenant: string;
  schemaPath?: string;
  outputDir?: string;
}

function uniqueModules(schema: TenantSchema): ModuleKey[] {
  const keys: ModuleKey[] = [];
  for (const page of Object.values(schema.pages)) {
    if (!page?.enabled) continue;
    for (const moduleConfig of page.modules ?? []) {
      if (!keys.includes(moduleConfig.key)) {
        keys.push(moduleConfig.key);
      }
    }
  }
  return orderedKeys.map((key) => ({
    key,
    importPath: MODULE_REGISTRY[key as keyof typeof MODULE_REGISTRY].importPath,
    displayName: MODULE_REGISTRY[key as keyof typeof MODULE_REGISTRY].displayName,
    props: propsByKey.get(key) ?? {}
  }));
}

export function normalizeTenantBuild(schema: TenantSchema): NormalizedTenantBuild {
  const enabledPages = Object.entries(schema.pages).filter(([, page]) => page.enabled) as [PageKey, TenantSchema["pages"][PageKey]][];
  const routes = Object.fromEntries(enabledPages.map(([key, page]) => [key, page.route])) as Record<PageKey, string>;
  const pageModules = Object.fromEntries(enabledPages.map(([key, page]) => [key, page.modules ?? [] as TenantModuleRef[]])) as Record<PageKey, TenantModuleRef[]>;
  const pages = enabledPages.map(([, page]) => ({
    path: page.route,
    style: { navigationBarTitleText: page.title }
  }));
  const modules = normalizeModuleEntries(schema);

function buildConfig(schema: TenantSchema): GeneratedTenantConfig {
  const pages = toEnabledPages(schema);
  return {
    tenant: schema.tenant,
    app: {
      appKey: schema.app.appKey,
      appid: schema.app.appid,
      name: schema.app.name,
      version: schema.app.version ?? '0.0.0-local'
    },
    pages,
    tabBar: {
      list: schema.tabs.map((tab) => ({
        pagePath: schema.pages[tab.page].route,
        text: tab.text,
        iconPath: tab.iconPath,
        selectedIconPath: tab.selectedIconPath
      }))
    },
    routes,
    pageModules,
    modules,
    features: schema.features ?? {},
    runtime: {
      theme: schema.theme ?? {},
      ...(schema.runtime ?? {})
    }
  };
}

function asTs(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function moduleImportName(moduleKey: ModuleKey): string {
  return moduleKey.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

function moduleEntrySource(modules: ModuleKey[]): string {
  const imports = modules
    .map((key) => `import { ${moduleImportName(key)}Adapter } from '../modules/${key}/index.js';`)
    .join('\n');
  const registryEntries = modules.map((key) => `  '${key}': ${moduleImportName(key)}Adapter`).join(',\n');
  const ordered = modules.map((key) => `  '${key}'`).join(',\n');
  return `${imports}\n\nimport type { ModuleKey } from '../../../../packages/schema/src/types.js';\nimport type { ModuleAdapter } from '../modules/types.js';\n\nexport const enabledModuleKeys = [\n${ordered}\n] as const satisfies readonly ModuleKey[];\n\nexport const moduleRegistry = {\n${registryEntries}\n} satisfies Partial<Record<ModuleKey, ModuleAdapter>>;\n`;
}

async function writeGenerated(outputDir: string, config: GeneratedTenantConfig): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, 'tenant.config.ts'), `export const tenantConfig = ${asTs(config.tenant)} as const;\n`);
  await writeFile(resolve(outputDir, 'app.config.ts'), `export const appConfig = ${asTs(config.app)} as const;\n`);
  await writeFile(resolve(outputDir, 'pages.config.ts'), `export const pagesConfig = ${asTs(config.pages)} as const;\n`);
  await writeFile(resolve(outputDir, 'tabbar.config.ts'), `export const tabbarConfig = ${asTs(config.tabs)} as const;\n`);
  await writeFile(resolve(outputDir, 'route.config.ts'), `export const routeConfig = ${asTs(config.pages.map(({ key, route, title }) => ({ key, route, title })))} as const;\n`);
  await writeFile(resolve(outputDir, 'runtime.config.ts'), `export const runtimeConfig = ${asTs(config.runtime)} as const;\nexport const featureConfig = ${asTs(config.features)} as const;\n`);
  await writeFile(resolve(outputDir, 'module-entry.ts'), moduleEntrySource(config.modules));
  await writeFile(resolve(outputDir, 'tenant.generated.json'), `${JSON.stringify(config, null, 2)}\n`);
}

export async function generateTenant(options: GenerateTenantOptions): Promise<GeneratedTenantConfig> {
  const schemaPath = options.schemaPath ?? resolve(repoRoot, 'schemas/tenants', `${options.tenant}.schema.json`);
  const outputDir = options.outputDir ?? resolve(repoRoot, 'apps/miniapp-template/src/generated');
  const raw = JSON.parse(await readFile(schemaPath, 'utf8')) as unknown;
  const schema = validateTenantSchema(raw);
  if (schema.tenant.tenantId !== options.tenant) {
    throw new Error(`schema tenantId ${schema.tenant.tenantId} does not match requested tenant ${options.tenant}`);
  }
  const config = buildConfig(schema);
  await writeGenerated(outputDir, config);
  return config;
}
