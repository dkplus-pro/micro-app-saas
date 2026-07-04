import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertValidTenantSchema } from '../packages/schema/src/validation.ts';
import type { TenantSchema } from '../packages/schema/src/types.ts';
import { getArg, getTenantList } from './args.ts';

async function main(): Promise<void> {
  const rootDir = process.cwd();
  const sourceDir = path.resolve(rootDir, getArg('source-dir', 'schemas/tenants') ?? 'schemas/tenants');
  const outDir = path.resolve(rootDir, getArg('out-dir', 'schemas/tenants') ?? 'schemas/tenants');
  const check = process.argv.includes('--check');
  const tenants = await resolveTenants(sourceDir);

  for (const tenant of tenants) {
    const schema = await loadSchemaSource(sourceDir, tenant);
    assertValidTenantSchema(schema);
    const json = `${JSON.stringify(schema, null, 2)}\n`;
    const outputPath = path.join(outDir, `${tenant}.schema.json`);

    if (check) {
      const current = await readFile(outputPath, 'utf8');
      if (current !== json) {
        throw new Error(`Schema JSON is out of date: ${path.relative(rootDir, outputPath)}. Run npm run emit:schema-json -- --tenant=${tenant}.`);
      }
      console.log(`CHECK schema ${tenant}`);
      continue;
    }

    await writeFile(outputPath, json, 'utf8');
    console.log(`WROTE schema ${path.relative(rootDir, outputPath)}`);
  }
}

async function resolveTenants(sourceDir: string): Promise<string[]> {
  const requested = getTenantList([]);
  if (requested.length > 0) return requested;

  const files = await readdir(sourceDir);
  return files
    .filter((file) => file.endsWith('.schema.ts'))
    .map((file) => file.replace(/\.schema\.ts$/, ''))
    .sort();
}

async function loadSchemaSource(sourceDir: string, tenant: string): Promise<TenantSchema> {
  const sourcePath = path.join(sourceDir, `${tenant}.schema.ts`);
  const moduleUrl = pathToFileURL(sourcePath).href;
  const module = await import(moduleUrl) as { default?: unknown; schema?: unknown };
  const schema = module.default ?? module.schema;
  if (!schema) throw new Error(`Missing default schema export in ${sourcePath}`);
  return schema as TenantSchema;
}

await main();
