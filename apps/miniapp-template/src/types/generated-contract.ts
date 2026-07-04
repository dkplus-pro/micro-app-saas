export interface TenantConfig {
  tenantId: string;
  tenantName: string;
}

export interface AppConfig {
  appKey: string;
  appid: string;
  name: string;
  versionName?: string;
  versionCode?: string | number;
}

export interface TabBarItemConfig {
  key: string;
  text: string;
  pagePath: string;
  iconPath?: string;
  selectedIconPath?: string;
}

export interface GeneratedModuleConfig {
  key: string;
  props?: Record<string, unknown>;
}

export interface GeneratedPageConfig {
  key: string;
  route: string;
  title: string;
  enabled: true;
  layout?: 'stream' | 'standard' | string;
  modules?: GeneratedModuleConfig[];
}

export type GeneratedModuleComponent = unknown;

export type GeneratedModuleRegistry = Readonly<Record<string, GeneratedModuleComponent>>;

export interface RuntimeConfig {
  theme?: Record<string, unknown>;
  features?: Record<string, boolean>;
  [key: string]: unknown;
}
