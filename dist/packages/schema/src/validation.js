import { MODULE_REGISTRY_SET, PAGE_ROUTE_PATTERN, featureKeyForModule } from './registry.js';
function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
}
export function validateTenantSchema(schema) {
    const errors = [];
    if (!schema || typeof schema !== 'object')
        errors.push('schema must be an object');
    if (!hasText(schema.tenant?.tenantId))
        errors.push('tenant.tenantId is required');
    if (!hasText(schema.tenant?.tenantName))
        errors.push('tenant.tenantName is required');
    if (!hasText(schema.app?.appKey))
        errors.push('app.appKey is required');
    if (!hasText(schema.app?.appid))
        errors.push('app.appid is required');
    if (!hasText(schema.app?.name))
        errors.push('app.name is required');
    const pages = schema.pages ?? {};
    const enabledRoutes = new Set();
    const allRoutes = new Set();
    for (const [pageKey, page] of Object.entries(pages)) {
        if (!PAGE_ROUTE_PATTERN.test(page.route))
            errors.push(`${pageKey}.route must match pages/<page>/index`);
        if (allRoutes.has(page.route))
            errors.push(`${pageKey}.route duplicates ${page.route}`);
        allRoutes.add(page.route);
        if (page.enabled)
            enabledRoutes.add(page.route);
        if (page.enabled && !hasText(page.title))
            errors.push(`${pageKey}.title is required for enabled page`);
        const seenModules = new Set();
        for (const moduleRef of page.modules ?? []) {
            if (!MODULE_REGISTRY_SET.has(moduleRef.key))
                errors.push(`${pageKey}.modules references unknown module ${moduleRef.key}`);
            if (seenModules.has(moduleRef.key))
                errors.push(`${pageKey}.modules contains duplicate module ${moduleRef.key}`);
            seenModules.add(moduleRef.key);
            const featureKey = featureKeyForModule(moduleRef.key);
            if (schema.features?.[featureKey] === false)
                errors.push(`${pageKey}.modules references disabled feature ${featureKey}`);
        }
    }
    if (!Array.isArray(schema.tabs) || schema.tabs.length < 1 || schema.tabs.length > 5) {
        errors.push('tabs must contain 1 to 5 items');
    }
    for (const tab of schema.tabs ?? []) {
        const target = pages[tab.page];
        if (!target)
            errors.push(`tab ${tab.key} points to missing page ${tab.page}`);
        if (target && !target.enabled)
            errors.push(`tab ${tab.key} points to disabled page ${tab.page}`);
        if (target && !enabledRoutes.has(target.route))
            errors.push(`tab ${tab.key} route ${target.route} is not enabled`);
        if (!hasText(tab.text))
            errors.push(`tab ${tab.key} text is required`);
    }
    return { valid: errors.length === 0, errors };
}
export function assertValidTenantSchema(schema) {
    const result = validateTenantSchema(schema);
    if (!result.valid)
        throw new Error(`Invalid tenant schema ${schema.tenant?.tenantId ?? '<unknown>'}:\n- ${result.errors.join('\n- ')}`);
}
