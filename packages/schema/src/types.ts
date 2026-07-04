export type ModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';
export type PageKey = 'page-a' | 'page-b' | 'page-c' | 'page-d';
export type ModuleFeatureKey = 'moduleA' | 'moduleB' | 'moduleC' | 'moduleD' | 'moduleE';
export type PageFeatureKey = 'pageA' | 'pageB' | 'pageC' | 'pageD';
export type TenantLegacyFeatures = Partial<Record<ModuleFeatureKey, boolean>> & {
  /** Page inclusion is controlled only by pages[].enabled / tabs, never by legacy features. */
  [K in PageFeatureKey]?: never;
};

export interface TenantInfo {
  tenantId: string;
  tenantName: string;
}

export interface AppInfo {
  appKey: string;
  appid: string;
  name: string;
  version?: string;
}

export type UniAppPackageType = 'main' | 'subPackage';

export interface TenantTab {
  key: string;
  text: string;
  page: PageKey;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface TabSchema extends TenantTab {}

export interface PageModuleConfig {
  key: ModuleKey;
  props?: Record<string, unknown>;
}

export interface PageModuleSchema extends PageModuleConfig {}
export interface TenantModuleRef extends PageModuleConfig {}

export interface TenantPage {
  route: `pages/${string}/index`;
  title: string;
  enabled: boolean;
  package?: UniAppPackageType;
  subPackageRoot?: `pages/${string}`;
  layout?: 'stream' | 'standard';
  modules?: PageModuleConfig[];
}

export interface PageSchema extends TenantPage {}

export interface TenantPageDefinition extends TenantPage {
  key: PageKey;
}

export type TenantPageMap = Partial<Record<PageKey, TenantPage>>;
export type TenantPages = TenantPageMap | TenantPageDefinition[];

export interface TenantCapabilities {
  modules?: Partial<Record<ModuleKey, boolean>>;
  [key: string]: unknown;
}

export interface TenantRuntimeConfig {
  themeColor?: string;
  logo?: string;
  banner?: string;
  assets?: TenantAssetsConfig;
  apiBase?: string;
  theme?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TenantImageAsset {
  src: `assets/${string}`;
  title?: string;
  description?: string;
  alt?: string;
}

export interface TenantAssetsConfig {
  pageAImage?: TenantImageAsset;
  [key: string]: unknown;
}

export interface TenantReleaseConfig {
  uploadEnabled?: boolean;
  auditEnabled?: boolean;
  releaseEnabled?: boolean;
}

export interface TenantSchema {
  tenant: TenantInfo;
  app: AppInfo;
  tabs: TenantTab[];
  pages: TenantPages;
  capabilities?: TenantCapabilities;
  /** @deprecated Module-only compatibility fallback; use capabilities.modules for new schemas. Page composition lives in pages. */
  features?: TenantLegacyFeatures;
  theme?: Record<string, unknown>;
  runtime?: TenantRuntimeConfig;
  release?: TenantReleaseConfig;
  schemaVersion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EnabledPage extends TenantPage {
  key: PageKey;
}

export interface GeneratedTenantConfig {
  tenant: TenantInfo;
  app: Required<Pick<AppInfo, 'appKey' | 'appid' | 'name'>> & { version: string };
  pages: EnabledPage[];
  tabs: Array<TabSchema & { route: string }>;
  modules: ModuleKey[];
  features: TenantLegacyFeatures;
  runtime: Record<string, unknown>;
}

export interface GeneratedModuleEntry {
  key: ModuleKey;
  importPath?: string;
  displayName?: string;
  props?: Record<string, unknown>;
}

export interface NormalizedTenantBuild {
  tenantId: string;
  appConfig: unknown;
  pages: unknown[];
  tabBar: unknown;
  routes: Record<string, string>;
  pageModules: Record<string, TenantModuleRef[]>;
  modules: GeneratedModuleEntry[];
  features: TenantLegacyFeatures;
  runtime: Record<string, unknown>;
}
