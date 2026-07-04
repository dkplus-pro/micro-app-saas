import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { MODULE_REGISTRY, validateTenantSchema } from "../../schema/src/index.ts";
import type { GeneratedModuleEntry, ModuleKey, NormalizedTenantBuild, PageKey, TenantModuleRef, TenantSchema } from "../../schema/src/index.ts";

export interface GenerateOptions {
  repoRoot: string;
  tenantId: string;
  writeTemplateGenerated?: boolean;
  writeDist?: boolean;
}

export interface GenerateResult {
  schemaPath: string;
  generatedDir: string;
  distDir: string;
  build: NormalizedTenantBuild;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function normalizeModuleEntries(schema: TenantSchema): GeneratedModuleEntry[] {
  const orderedKeys: ModuleKey[] = [];
  const propsByKey = new Map<ModuleKey, Record<string, unknown>>();
  for (const page of Object.values(schema.pages)) {
    for (const moduleRef of page.modules ?? []) {
      if (!orderedKeys.includes(moduleRef.key)) {
        orderedKeys.push(moduleRef.key);
      }
      propsByKey.set(moduleRef.key, moduleRef.props ?? {});
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

  return {
    tenant: schema.tenant,
    app: {
      appKey: schema.app.appKey,
      appid: schema.app.appid,
      name: schema.app.name,
      version: schema.app.version ?? schema.release?.version ?? "0.1.0"
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
    },
    release: {
      version: schema.release?.version ?? schema.app.version ?? "0.1.0",
      dryRun: schema.release?.dryRun ?? true,
      ciGroup: schema.release?.ciGroup ?? "default"
    }
  };
}

function asTsConst(name: string, value: unknown): string {
  return `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

function moduleEntrySource(build: NormalizedTenantBuild): string {
  const imports = build.modules
    .map((moduleEntry, index) => `import * as module${index} from "${moduleEntry.importPath}";`)
    .join("\n");
  const entries = build.modules
    .map((moduleEntry, index) => `  { key: ${JSON.stringify(moduleEntry.key)}, displayName: ${JSON.stringify(moduleEntry.displayName)}, props: ${JSON.stringify(moduleEntry.props)}, module: module${index} }`)
    .join(",\n");
  return `${imports}\n\nexport const tenantModules = [\n${entries}\n] as const;\n\nexport type TenantModuleKey = typeof tenantModules[number]["key"];\n`;
}

async function writeGeneratedFiles(dir: string, build: NormalizedTenantBuild): Promise<void> {
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(path.join(dir, "tenant.config.ts"), asTsConst("tenantConfig", build.tenant)),
    writeFile(path.join(dir, "app.config.ts"), asTsConst("appConfig", build.app)),
    writeFile(path.join(dir, "pages.config.ts"), asTsConst("pagesConfig", build.pages)),
    writeFile(path.join(dir, "tabbar.config.ts"), asTsConst("tabBarConfig", build.tabBar)),
    writeFile(path.join(dir, "route.config.ts"), asTsConst("routeConfig", build.routes)),
    writeFile(path.join(dir, "runtime.config.ts"), asTsConst("runtimeConfig", build.runtime)),
    writeFile(path.join(dir, "module-entry.ts"), moduleEntrySource(build)),
    writeFile(path.join(dir, "build.generated.json"), stableJson(build)),
    writeFile(path.join(dir, "manifest.generated.json"), stableJson({
      name: build.app.name,
      appid: build.app.appid,
      versionName: build.app.version,
      "mp-weixin": { appid: build.app.appid, setting: { urlCheck: false } }
    })),
    writeFile(path.join(dir, "pages.generated.json"), stableJson({ pages: build.pages, tabBar: build.tabBar }))
  ]);
}

export async function generateTenant(options: GenerateOptions): Promise<GenerateResult> {
  const schemaPath = path.join(options.repoRoot, "schemas", "tenants", `${options.tenantId}.schema.json`);
  const schema = validateTenantSchema(JSON.parse(await readFile(schemaPath, "utf8")));
  const build = normalizeTenantBuild(schema);
  const generatedDir = path.join(options.repoRoot, "apps", "miniapp-template", "src", "generated");
  const distDir = path.join(options.repoRoot, "apps", "miniapp-template", "dist", "tenants", options.tenantId);

  if (options.writeTemplateGenerated ?? true) {
    await writeGeneratedFiles(generatedDir, build);
  }
  if (options.writeDist ?? true) {
    await writeGeneratedFiles(distDir, build);
    await writeFile(path.join(distDir, "build-report.json"), stableJson({
      tenantId: build.tenant.tenantId,
      appKey: build.app.appKey,
      version: build.release.version,
      buildStatus: "success",
      uploadStatus: "not_started",
      auditStatus: "not_started",
      releaseStatus: "not_started",
      dryRun: true,
      generatedAt: new Date().toISOString()
    }));
  }

  return { schemaPath, generatedDir, distDir, build };
}
