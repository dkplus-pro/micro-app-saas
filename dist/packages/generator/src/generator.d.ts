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
export declare function loadTenantSchema(tenant: string, schemaDir?: string): Promise<TenantSchema>;
export declare function collectEnabledPages(schema: TenantSchema): Array<[string, TenantPage]>;
export declare function collectUsedModules(schema: TenantSchema): ModuleKey[];
export declare function createArtifacts(schema: TenantSchema): GeneratedTenantArtifacts;
export declare function generateTenant(options: GenerateOptions): Promise<GeneratedTenantArtifacts>;
