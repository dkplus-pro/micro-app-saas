export type ModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';

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

export interface TenantTab {
  key: string;
  text: string;
  page: string;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface PageModuleConfig {
  key: ModuleKey;
  props?: Record<string, unknown>;
}

export interface TenantPage {
  route: string;
  title: string;
  enabled: boolean;
  layout?: 'stream' | 'standard';
  modules?: PageModuleConfig[];
}

export interface TenantRuntimeConfig {
  themeColor?: string;
  logo?: string;
  banner?: string;
  apiBase?: string;
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
  pages: Record<string, TenantPage>;
  features: Record<string, boolean>;
  runtime?: TenantRuntimeConfig;
  release?: TenantReleaseConfig;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
