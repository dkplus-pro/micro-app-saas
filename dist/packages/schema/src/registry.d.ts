import type { ModuleKey } from './types.ts';
export declare const MODULE_REGISTRY: readonly ["module-a", "module-b", "module-c", "module-d", "module-e"];
export declare const MODULE_REGISTRY_SET: Set<string>;
export declare const PAGE_ROUTE_PATTERN: RegExp;
export declare function featureKeyForModule(moduleKey: ModuleKey): string;
