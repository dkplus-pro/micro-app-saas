export const MODULE_REGISTRY = ['module-a', 'module-b', 'module-c', 'module-d', 'module-e'];
export const MODULE_REGISTRY_SET = new Set(MODULE_REGISTRY);
export const PAGE_ROUTE_PATTERN = /^pages\/[a-z0-9-]+\/index$/;
export function featureKeyForModule(moduleKey) {
    return moduleKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
