import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertValidTenantSchema } from '../../schema/src/validation.ts';
import type { ModuleKey, TenantImageAsset, TenantPage, TenantSchema, UniAppPackageType } from '../../schema/src/types.ts';

interface GeneratedPageArtifact {
  key: string;
  path: string;
  style: { navigationBarTitleText: string };
  package: UniAppPackageType;
  subPackageRoot?: string;
  subPackagePath?: string;
  layout: 'stream' | 'standard';
  modules: NonNullable<TenantPage['modules']>;
}

interface UniSubPackagePage {
  path: string;
  style: { navigationBarTitleText: string };
}

interface UniSubPackageConfig {
  root: string;
  pages: UniSubPackagePage[];
}

const MODULE_ASSETS_SUBPACKAGE_ROOT = 'pages/module-assets';
const MODULE_ASSETS_ENTRY_PATH = path.posix.join(MODULE_ASSETS_SUBPACKAGE_ROOT, 'module-entry.ts');
const MODULE_ASSETS_PAGE: UniSubPackagePage = {
  path: 'index',
  style: { navigationBarTitleText: '模块分包' }
};

export interface GeneratedTenantArtifacts {
  tenantId: string;
  appConfig: unknown;
  pagesConfig: GeneratedPageArtifact[];
  subPackagesConfig: UniSubPackageConfig[];
  tabbarConfig: unknown;
  routeConfig: unknown;
  runtimeConfig: unknown;
  uniPagesJson: unknown;
  uniManifestJson: unknown;
  moduleEntrySource: string;
  homeModuleRendererSource: string;
  pageAAssetsSource: string;
  subPackageModuleEntrySource: string;
  usedModules: ModuleKey[];
  homeModules: ModuleKey[];
  subPackageModules: ModuleKey[];
  pageRoutes: string[];
}

export interface GenerateOptions {
  tenant: string;
  schemaDir?: string;
  outputDir?: string;
  writeUniAppConfig?: boolean;
  uniAppSrcDir?: string;
}

export async function loadTenantSchema(tenant: string, schemaDir = 'schemas/tenants'): Promise<TenantSchema> {
  const schemaPath = path.resolve(schemaDir, `${tenant}.schema.json`);
  const schema = JSON.parse(await readFile(schemaPath, 'utf8')) as TenantSchema;
  assertValidTenantSchema(schema);
  return schema;
}

export function collectEnabledPages(schema: TenantSchema): Array<[string, TenantPage]> {
  return Object.entries(schema.pages).filter(([, page]) => page.enabled);
}

export function collectUsedModules(schema: TenantSchema): ModuleKey[] {
  return collectPageModules(collectEnabledPages(schema));
}

function collectPageModules(pages: Array<[string, TenantPage]>): ModuleKey[] {
  const modules: ModuleKey[] = [];
  for (const [, page] of pages) {
    for (const moduleRef of page.modules ?? []) {
      if (!modules.includes(moduleRef.key)) modules.push(moduleRef.key);
    }
  }
  return modules;
}

export function createArtifacts(schema: TenantSchema): GeneratedTenantArtifacts {
  const enabledPages = collectEnabledPages(schema);
  const usedModules = collectUsedModules(schema);
  const homeModules = collectPageModules(enabledPages.filter(([key]) => key === 'page-a'));
  const subPackageModules = usedModules.filter((moduleKey) => !homeModules.includes(moduleKey));
  const tabPageKeys = new Set<string>(schema.tabs.map((tab) => tab.page));
  const pagesConfig = enabledPages.map(([key, page]) => {
    const packageType = getPagePackage(page, tabPageKeys.has(key));
    const subPackageRoot = packageType === 'subPackage' ? getSubPackageRoot(page) : undefined;
    return removeUndefined({
      key,
      path: page.route,
      style: { navigationBarTitleText: page.title },
      package: packageType,
      subPackageRoot,
      subPackagePath: subPackageRoot ? relativeSubPackagePath(page.route, subPackageRoot) : undefined,
      layout: page.layout ?? 'standard',
      modules: page.modules ?? []
    });
  });
  const tabs = schema.tabs.map((tab) => {
    const page = schema.pages[tab.page];
    return {
      key: tab.key,
      text: tab.text,
      pagePath: page?.route ?? (() => { throw new Error(`tab ${tab.key} references missing page ${tab.page}`); })(),
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
  const runtimeConfig = { features: schema.features, runtime: schema.runtime ?? {} };
  const subPackagesConfig = withModuleAssetsSubPackage(createSubPackagesConfig(pagesConfig), subPackageModules);
  const uniPagesJson = removeUndefined({
    pages: pagesConfig
      .filter((page) => page.package === 'main')
      .map((page) => ({ path: page.path, style: page.style })),
    subPackages: subPackagesConfig.length > 0 ? subPackagesConfig : undefined,
    tabBar: {
      color: '#64748b',
      selectedColor: schema.runtime?.themeColor ?? '#1677ff',
      backgroundColor: '#ffffff',
      borderStyle: 'black',
      list: tabs.map((tab) => removeUndefined({
        pagePath: tab.pagePath,
        text: tab.text,
        iconPath: tab.iconPath,
        selectedIconPath: tab.selectedIconPath
      }))
    }
  });
  const uniManifestJson = {
    name: appConfig.name,
    appid: '',
    description: `${schema.tenant.tenantName} tenant mini-program`,
    versionName: appConfig.version,
    versionCode: toVersionCode(appConfig.version),
    transformPx: false,
    'mp-weixin': {
      appid: appConfig.appid,
      setting: {
        urlCheck: false,
        es6: true,
        minified: true
      },
      usingComponents: true
    }
  };
  const moduleEntrySource = moduleEntrySourceFor('moduleEntries', 'GeneratedModuleKey', homeModules);
  const homeModuleRendererSource = homeModuleRendererSourceFor(homeModules);
  const pageAAssetsSource = pageAAssetsSourceFor(schema.runtime?.assets?.pageAImage);
  const subPackageModuleEntrySource = moduleDescriptorEntrySourceFor('subPackageModuleEntries', 'GeneratedSubPackageModuleKey', subPackageModules);
  return {
    tenantId: schema.tenant.tenantId,
    appConfig,
    pagesConfig,
    subPackagesConfig,
    tabbarConfig: { list: tabs },
    routeConfig,
    runtimeConfig,
    uniPagesJson,
    uniManifestJson,
    moduleEntrySource,
    homeModuleRendererSource,
    pageAAssetsSource,
    subPackageModuleEntrySource,
    usedModules,
    homeModules,
    subPackageModules,
    pageRoutes: enabledPages.map(([, page]) => page.route)
  };
}

function getPagePackage(page: TenantPage, isTabPage: boolean): UniAppPackageType {
  return page.package ?? (page.route === 'pages/page-a/index' || isTabPage ? 'main' : 'subPackage');
}

function getSubPackageRoot(page: TenantPage): string {
  return page.subPackageRoot ?? path.posix.dirname(page.route);
}

function relativeSubPackagePath(route: string, root: string): string {
  const prefix = `${root}/`;
  if (!route.startsWith(prefix)) throw new Error(`route ${route} must be under subPackageRoot ${root}`);
  return route.slice(prefix.length);
}

function createSubPackagesConfig(pages: GeneratedPageArtifact[]): UniSubPackageConfig[] {
  const groups = new Map<string, UniSubPackagePage[]>();
  for (const page of pages) {
    if (page.package !== 'subPackage') continue;
    if (!page.subPackageRoot || !page.subPackagePath) throw new Error(`subPackage page ${page.key} is missing package metadata`);
    const group = groups.get(page.subPackageRoot) ?? [];
    group.push({ path: page.subPackagePath, style: page.style });
    groups.set(page.subPackageRoot, group);
  }
  return [...groups.entries()].map(([root, packagePages]) => ({ root, pages: packagePages }));
}

function withModuleAssetsSubPackage(
  subPackages: UniSubPackageConfig[],
  subPackageModules: readonly ModuleKey[]
): UniSubPackageConfig[] {
  if (subPackageModules.length === 0) return subPackages;
  if (subPackages.some((subPackage) => subPackage.root === MODULE_ASSETS_SUBPACKAGE_ROOT)) return subPackages;
  return [...subPackages, { root: MODULE_ASSETS_SUBPACKAGE_ROOT, pages: [MODULE_ASSETS_PAGE] }];
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function toVersionCode(version: string): string {
  const parts = version.split('.').map((part) => Number.parseInt(part, 10)).filter((part) => Number.isFinite(part));
  const [major = 0, minor = 0, patch = 0] = parts;
  return String(major * 10000 + minor * 100 + patch);
}

function tsExport(name: string, value: unknown): string {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

function moduleEntrySourceFor(exportName: string, typeName: string, modules: readonly ModuleKey[]): string {
  return [
    ...modules.map((moduleKey) => `import ${moduleKey.replaceAll('-', '')} from '../modules/${moduleKey}/index.js';`),
    '',
    `export const ${exportName} = {`,
    ...modules.map((moduleKey) => `  '${moduleKey}': ${moduleKey.replaceAll('-', '')},`),
    '} as const;',
    '',
    `export type ${typeName} = keyof typeof ${exportName};`
  ].join('\n');
}

function homeModuleRendererSourceFor(modules: readonly ModuleKey[]): string {
  return [
    '<template>',
    '  <view class="generated-home-modules">',
    ...modules.flatMap((moduleKey) => {
      const componentName = componentIdentifierFor(moduleKey);
      return [
        `    <${componentName}`,
        `      v-for="(module, index) in modulesByKey['${moduleKey}'] ?? []"`,
        `      :key="module.key + '-' + index"`,
        '      v-bind="module.props"',
        '    />'
      ];
    }),
    '  </view>',
    '</template>',
    '',
    '<script setup lang="ts">',
    "import { computed } from 'vue';",
    ...modules.map((moduleKey) => `import ${componentIdentifierFor(moduleKey)} from '../modules/${moduleKey}/index.vue';`),
    '',
    'type HomeModule = {',
    '  key: string;',
    '  props?: Record<string, unknown>;',
    '};',
    '',
    'const props = defineProps<{',
    '  modules: readonly HomeModule[];',
    '}>();',
    '',
    'const modulesByKey = computed(() => {',
    '  const grouped: Record<string, HomeModule[]> = {};',
    '  for (const moduleRef of props.modules) {',
    '    grouped[moduleRef.key] = [...(grouped[moduleRef.key] ?? []), moduleRef];',
    '  }',
    '  return grouped;',
    '});',
    '</script>'
  ].join('\n');
}

function componentIdentifierFor(moduleKey: ModuleKey): string {
  return moduleKey
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function moduleDescriptorEntrySourceFor(exportName: string, typeName: string, modules: readonly ModuleKey[]): string {
  return [
    `export const ${exportName} = {`,
    ...modules.map((moduleKey) => `  '${moduleKey}': { key: '${moduleKey}', renderLabel: '${moduleKey}' },`),
    '} as const;',
    '',
    `export type ${typeName} = keyof typeof ${exportName};`
  ].join('\n');
}

function pageAAssetsSourceFor(image?: TenantImageAsset): string {
  if (!image) {
    return [
      'export const pageAAssets = {',
      '  image: undefined',
      '} as const;'
    ].join('\n');
  }
  return [
    `import pageAImageSrc from '../${image.src}';`,
    '',
    'export const pageAAssets = {',
    '  image: {',
    '    src: pageAImageSrc,',
    `    title: ${JSON.stringify(image.title ?? '')},`,
    `    description: ${JSON.stringify(image.description ?? '')}`,
    '  }',
    '} as const;'
  ].join('\n');
}

export async function generateTenant(options: GenerateOptions): Promise<GeneratedTenantArtifacts> {
  const schema = await loadTenantSchema(options.tenant, options.schemaDir);
  const artifacts = createArtifacts(schema);
  const outputDir = path.resolve(options.outputDir ?? 'apps/miniapp-template/src/generated');
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'tenant.config.ts'), tsExport('tenantConfig', schema.tenant));
  await writeFile(path.join(outputDir, 'app.config.ts'), tsExport('appConfig', artifacts.appConfig));
  await writeFile(path.join(outputDir, 'pages.config.ts'), tsExport('pagesConfig', artifacts.pagesConfig));
  await writeFile(path.join(outputDir, 'subpackages.config.ts'), tsExport('subPackagesConfig', artifacts.subPackagesConfig));
  await writeFile(path.join(outputDir, 'tabbar.config.ts'), tsExport('tabbarConfig', artifacts.tabbarConfig));
  await writeFile(path.join(outputDir, 'route.config.ts'), tsExport('routeConfig', artifacts.routeConfig));
  await writeFile(path.join(outputDir, 'runtime.config.ts'), tsExport('runtimeConfig', artifacts.runtimeConfig));
  await writeFile(path.join(outputDir, 'module-entry.ts'), `${artifacts.moduleEntrySource}\n`);
  await writeFile(path.join(outputDir, 'home-module-renderer.vue'), `${artifacts.homeModuleRendererSource}\n`);
  await writeFile(path.join(outputDir, 'page-a-assets.ts'), `${artifacts.pageAAssetsSource}\n`);
  await writeFile(path.join(outputDir, 'subpackage-module-entry.ts'), `${artifacts.subPackageModuleEntrySource}\n`);
  await writeFile(path.join(outputDir, 'build-summary.json'), `${JSON.stringify({
    tenantId: artifacts.tenantId,
    pageRoutes: artifacts.pageRoutes,
    usedModules: artifacts.usedModules,
    homeModules: artifacts.homeModules,
    subPackageModules: artifacts.subPackageModules
  }, null, 2)}\n`);

  if (options.writeUniAppConfig ?? !options.outputDir) {
    const uniAppSrcDir = path.resolve(options.uniAppSrcDir ?? 'apps/miniapp-template/src');
    await mkdir(uniAppSrcDir, { recursive: true });
    await writeFile(path.join(uniAppSrcDir, 'pages.json'), `${JSON.stringify(artifacts.uniPagesJson, null, 2)}\n`);
    await writeFile(path.join(uniAppSrcDir, 'manifest.json'), `${JSON.stringify(artifacts.uniManifestJson, null, 2)}\n`);
    const moduleAssetsEntryPath = path.join(uniAppSrcDir, MODULE_ASSETS_ENTRY_PATH);
    await mkdir(path.dirname(moduleAssetsEntryPath), { recursive: true });
    await writeFile(moduleAssetsEntryPath, `${artifacts.subPackageModuleEntrySource}\n`);
  }

  return artifacts;
}
