export type TenantId = string;
export type PageKey = `page-${string}`;
export type ModuleKey = `module-${string}`;

export interface TenantInfo {
  tenantId: TenantId;
  tenantName: string;
}

export interface AppInfo {
  appKey: string;
  appid: string;
  name: string;
  version?: string;
}

export interface TenantTab {
  key: string;
  text: string;
  page: PageKey;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface TenantModuleRef {
  key: ModuleKey;
  props?: Record<string, unknown>;
}

export interface TenantPage {
  route: string;
  title: string;
  enabled: boolean;
  layout?: "standard" | "stream";
  modules?: TenantModuleRef[];
}

export interface TenantReleaseConfig {
  version?: string;
  dryRun?: boolean;
  ciGroup?: string;
}

export interface TenantSchema {
  tenant: TenantInfo;
  app: AppInfo;
  tabs: TenantTab[];
  pages: Record<PageKey, TenantPage>;
  features?: Record<string, boolean>;
  theme?: Record<string, unknown>;
  runtime?: Record<string, unknown>;
  build?: Record<string, unknown>;
  release?: TenantReleaseConfig;
}

export interface GeneratedPageConfig {
  path: string;
  style: {
    navigationBarTitleText: string;
  };
}

export interface GeneratedTabItem {
  pagePath: string;
  text: string;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface GeneratedModuleEntry {
  key: ModuleKey;
  importPath: string;
  displayName: string;
  props: Record<string, unknown>;
}

export interface NormalizedTenantBuild {
  tenant: TenantInfo;
  app: Required<Pick<AppInfo, "appKey" | "appid" | "name">> & { version: string };
  pages: GeneratedPageConfig[];
  tabBar: {
    list: GeneratedTabItem[];
  };
  routes: Record<PageKey, string>;
  pageModules: Record<PageKey, TenantModuleRef[]>;
  modules: GeneratedModuleEntry[];
  features: Record<string, boolean>;
  runtime: Record<string, unknown>;
  release: Required<TenantReleaseConfig>;
}
