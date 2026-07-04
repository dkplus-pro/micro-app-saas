export function getArg(name, fallback) {
    const prefix = `--${name}=`;
    const exact = `--${name}`;
    const argv = process.argv.slice(2);
    for (let index = 0; index < argv.length; index += 1) {
        const item = argv[index];
        if (item.startsWith(prefix))
            return item.slice(prefix.length);
        if (item === exact)
            return argv[index + 1] ?? fallback;
    }
    return fallback;
}
export function requireArg(name) {
    const value = getArg(name);
    if (!value)
        throw new Error(`Missing required --${name}=<value>`);
    return value;
}
export function getTenantList(defaultList = ['app1', 'app2']) {
    const tenants = getArg('tenants') ?? getArg('tenant');
    return tenants ? tenants.split(',').map((tenant) => tenant.trim()).filter(Boolean) : defaultList;
}
