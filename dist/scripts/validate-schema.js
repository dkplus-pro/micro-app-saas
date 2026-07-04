import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateTenantSchema } from '../packages/schema/src/validation.ts';
import { getTenantList } from './args.ts';
async function main() {
    const schemaDir = path.join(process.cwd(), 'schemas/tenants');
    const requested = getTenantList([]);
    const files = requested.length > 0 ? requested.map((tenant) => `${tenant}.schema.json`) : (await readdir(schemaDir)).filter((file) => file.endsWith('.schema.json'));
    let failed = false;
    for (const file of files) {
        const fullPath = path.join(schemaDir, file);
        const schema = JSON.parse(await readFile(fullPath, 'utf8'));
        const result = validateTenantSchema(schema);
        if (result.valid) {
            console.log(`PASS schema ${schema.tenant.tenantId}`);
        }
        else {
            failed = true;
            console.error(`FAIL schema ${file}\n- ${result.errors.join('\n- ')}`);
        }
    }
    if (failed)
        process.exitCode = 1;
}
await main();
