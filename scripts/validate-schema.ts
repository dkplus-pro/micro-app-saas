import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateTenantSchema } from '../packages/schema/src/validate.js';
import { readArg } from './args.js';

const tenant = readArg('tenant', 'app1');
const schemaPath = resolve('schemas/tenants', `${tenant}.schema.json`);
const schema = validateTenantSchema(JSON.parse(await readFile(schemaPath, 'utf8')));
console.log(`PASS validate:schema tenant=${schema.tenant.tenantId} pages=${Object.keys(schema.pages).length}`);
