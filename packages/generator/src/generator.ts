import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertValidTenantSchema } from '../../schema/src/validation.js';
import type { ModuleKey, TenantPage, TenantSchema } from '../../schema/src/types.js';

export interface GeneratedTenantArtifacts {
  tenantId: string;
  appConfig: unknown;
  pagesConfig: unknown;
  tabbarConfig: unknown;
  routeConfig: unknown;
  runtimeConfig: unknown;
  moduleEntrySource: string;
  usedModules: ModuleKey[];
  pageRoutes: string[];
}

export interface GenerateOptions {
  tenant: string;
  schemaDir?: string;
  outputDir?: string;
}

export async function loadTenantSchema(tenant: string, schemaDir = 'schemas/tenants'): Promise<TenantSchema> {
  const schemaPath = path.join(process.cwd(), schemaDir, `${tenant}.schema.json`);
  const schema = JSON.parse(await readFile(schemaPath, 'utf8')) as TenantSchema;
  assertValidTenantSchema(schema);
  return schema;
}

export function collectEnabledPages(schema: TenantSchema): Array<[string, TenantPage]> {
  return Object.entries(schema.pages).filter(([, page]) => page.enabled);
}

export function collectUsedModules(schema: TenantSchema): ModuleKey[] {
  const modules: ModuleKey[] = [];
  for (const [, page] of collectEnabledPages(schema)) {
    for (const moduleRef of page.modules ?? []) {
      if (!modules.includes(moduleRef.key)) modules.push(moduleRef.key);
    }
  }
  return modules;
}

export function createArtifacts(schema: TenantSchema): GeneratedTenantArtifacts {
  const enabledPages = collectEnabledPages(schema);
  const usedModules = collectUsedModules(schema);
  const pagesConfig = enabledPages.map(([key, page]) => ({
    key,
    path: page.route,
    style: { navigationBarTitleText: page.title },
    layout: page.layout ?? 'standard',
    modules: page.modules ?? []
  }));
  const tabs = schema.tabs.map((tab) => {
    const page = schema.pages[tab.page];
    return {
      key: tab.key,
      text: tab.text,
      pagePath: page.route,
      iconPath: tab.iconPath,
      selectedIconPath: tab.selectedIconPath
    };
  });
  const appConfig = {
    tenantId: schema.tenant.tenantId,
    tenantName: schema.tenant.tenantName,
    appKey: schema.app.appKey,
    appid: schema.app.appid,
    name: schema.app.name,
    version: schema.app.version ?? '0.0.0'
  };
  const routeConfig = Object.fromEntries(enabledPages.map(([key, page]) => [key, page.route]));
  const moduleEntrySource = [
    ...usedModules.map((moduleKey) => `import ${moduleKey.replaceAll('-', '')} from '../modules/${moduleKey}/index.js';`),
    '',
    'export const moduleEntries = {',
    ...usedModules.map((moduleKey) => `  '${moduleKey}': ${moduleKey.replaceAll('-', '')},`),
    '} as const;',
    '',
    'export type GeneratedModuleKey = keyof typeof moduleEntries;'
  ].join('\n');
  return {
    tenantId: schema.tenant.tenantId,
    appConfig,
    pagesConfig,
    tabbarConfig: { list: tabs },
    routeConfig,
    runtimeConfig: { features: schema.features, runtime: schema.runtime ?? {} },
    moduleEntrySource,
    usedModules,
    pageRoutes: enabledPages.map(([, page]) => page.route)
  };
}

function tsExport(name: string, value: unknown): string {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

export async function generateTenant(options: GenerateOptions): Promise<GeneratedTenantArtifacts> {
  const schema = await loadTenantSchema(options.tenant, options.schemaDir);
  const artifacts = createArtifacts(schema);
  const outputDir = path.join(process.cwd(), options.outputDir ?? 'apps/miniapp-template/src/generated');
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'tenant.config.ts'), tsExport('tenantConfig', schema.tenant));
  await writeFile(path.join(outputDir, 'app.config.ts'), tsExport('appConfig', artifacts.appConfig));
  await writeFile(path.join(outputDir, 'pages.config.ts'), tsExport('pagesConfig', artifacts.pagesConfig));
  await writeFile(path.join(outputDir, 'tabbar.config.ts'), tsExport('tabbarConfig', artifacts.tabbarConfig));
  await writeFile(path.join(outputDir, 'route.config.ts'), tsExport('routeConfig', artifacts.routeConfig));
  await writeFile(path.join(outputDir, 'runtime.config.ts'), tsExport('runtimeConfig', artifacts.runtimeConfig));
  await writeFile(path.join(outputDir, 'module-entry.ts'), `${artifacts.moduleEntrySource}\n`);
  await writeFile(path.join(outputDir, 'build-summary.json'), `${JSON.stringify({ tenantId: artifacts.tenantId, pageRoutes: artifacts.pageRoutes, usedModules: artifacts.usedModules }, null, 2)}\n`);
  return artifacts;
}
