export type TenantId = string;

export type ModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';

export type PageKey = 'page-a' | 'page-b' | 'page-c' | 'page-d';

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

export interface TabSchema {
  key: string;
  text: string;
  page: PageKey;
}

export interface PageModuleSchema {
  key: ModuleKey;
  props?: Record<string, unknown>;
}

export interface PageSchema {
  route: `pages/${string}/index`;
  title: string;
  enabled: boolean;
  layout?: 'stream' | 'standard';
  modules?: PageModuleSchema[];
}

export interface TenantSchema {
  tenant: TenantInfo;
  app: AppInfo;
  tabs: TabSchema[];
  pages: Partial<Record<PageKey, PageSchema>>;
  features: Record<string, boolean>;
  theme?: Record<string, unknown>;
  runtime?: Record<string, unknown>;
  release?: Record<string, unknown>;
}

export interface EnabledPage extends PageSchema {
  key: PageKey;
}

export interface GeneratedTenantConfig {
  tenant: TenantInfo;
  app: Required<Pick<AppInfo, 'appKey' | 'appid' | 'name'>> & { version: string };
  pages: EnabledPage[];
  tabs: Array<TabSchema & { route: string }>;
  modules: ModuleKey[];
  features: Record<string, boolean>;
  runtime: Record<string, unknown>;
}
