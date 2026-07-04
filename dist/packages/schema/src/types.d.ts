export type ModuleKey = 'module-a' | 'module-b' | 'module-c' | 'module-d' | 'module-e';
export type PageKey = 'page-a' | 'page-b' | 'page-c' | 'page-d';
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
    page: PageKey;
    iconPath?: string;
    selectedIconPath?: string;
}
export interface TabSchema extends TenantTab {
}
export interface PageModuleConfig {
    key: ModuleKey;
    props?: Record<string, unknown>;
}
export interface PageModuleSchema extends PageModuleConfig {
}
export interface TenantModuleRef extends PageModuleConfig {
}
export interface TenantPage {
    route: `pages/${string}/index`;
    title: string;
    enabled: boolean;
    layout?: 'stream' | 'standard';
    modules?: PageModuleConfig[];
}
export interface PageSchema extends TenantPage {
}
export interface TenantRuntimeConfig {
    themeColor?: string;
    logo?: string;
    banner?: string;
    apiBase?: string;
    theme?: Record<string, unknown>;
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
    pages: Partial<Record<PageKey, TenantPage>>;
    features: Record<string, boolean>;
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
    app: Required<Pick<AppInfo, 'appKey' | 'appid' | 'name'>> & {
        version: string;
    };
    pages: EnabledPage[];
    tabs: Array<TabSchema & {
        route: string;
    }>;
    modules: ModuleKey[];
    features: Record<string, boolean>;
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
    features: Record<string, boolean>;
    runtime: Record<string, unknown>;
}
