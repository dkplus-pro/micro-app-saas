import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { assertValidTenantSchema } from '../packages/schema/src/validation.ts';
import type { TenantSchema } from '../packages/schema/src/types.ts';
import { getArg, getTenantList } from './args.ts';

async function main(): Promise<void> {
  const rootDir = process.cwd();
  const sourceDir = path.resolve(rootDir, getArg('source-dir', 'schemas/tenants') ?? 'schemas/tenants');
  const outDir = path.resolve(rootDir, getArg('out-dir', 'schemas/tenants') ?? 'schemas/tenants');
  const tsDir = path.resolve(rootDir, getArg('ts-dir') ?? (hasFlag('from-json') ? outDir : sourceDir));
  const jsonDir = path.resolve(rootDir, getArg('json-dir') ?? (hasFlag('from-json') ? sourceDir : outDir));
  const check = process.argv.includes('--check');
  const fromJson = hasFlag('from-json');

  if (fromJson) {
    await emitTenantSourcesFromJson({ rootDir, jsonDir, tsDir, check });
    return;
  }

  await emitTenantJsonFromSources({ rootDir, tsDir, jsonDir, check });
}

interface EmitOptions {
  rootDir: string;
  check: boolean;
}

interface SourceToJsonOptions extends EmitOptions {
  tsDir: string;
  jsonDir: string;
}

interface JsonToSourceOptions extends EmitOptions {
  jsonDir: string;
  tsDir: string;
}

async function emitTenantJsonFromSources({ rootDir, tsDir, jsonDir, check }: SourceToJsonOptions): Promise<void> {
  const tenants = await resolveTenants(tsDir, '.schema.ts');
  for (const tenant of tenants) {
    const schema = await loadSchemaSource(tsDir, tenant);
    assertValidTenantSchema(schema);
    const json = `${JSON.stringify(schema, null, 2)}\n`;
    const outputPath = path.join(jsonDir, `${tenant}.schema.json`);

    if (check) {
      const current = await readFile(outputPath, 'utf8');
      if (current !== json) {
        throw new Error(`Schema JSON is out of date: ${path.relative(rootDir, outputPath)}. Run npm run emit:schema-json -- --tenant=${tenant}.`);
      }
      console.log(`CHECK schema ${tenant}`);
      continue;
    }

    await mkdir(jsonDir, { recursive: true });
    await writeFile(outputPath, json, 'utf8');
    console.log(`WROTE schema ${path.relative(rootDir, outputPath)}`);
  }
}

async function emitTenantSourcesFromJson({ rootDir, jsonDir, tsDir, check }: JsonToSourceOptions): Promise<void> {
  const tenants = await resolveTenants(jsonDir, '.schema.json');
  for (const tenant of tenants) {
    const schema = await loadJsonSchema(jsonDir, tenant);
    assertValidTenantSchema(schema);
    const source = tenantSourceFor(schema);
    const outputPath = path.join(tsDir, `${tenant}.schema.ts`);

    if (check) {
      const current = await readFile(outputPath, 'utf8');
      if (current !== source) {
        throw new Error(`Schema TS source is out of date: ${path.relative(rootDir, outputPath)}. Run npm run emit:schema-json -- --from-json --tenant=${tenant}.`);
      }
      console.log(`CHECK schema source ${tenant}`);
      continue;
    }

    await mkdir(tsDir, { recursive: true });
    await writeFile(outputPath, source, 'utf8');
    console.log(`WROTE schema source ${path.relative(rootDir, outputPath)}`);
  }
}

async function resolveTenants(sourceDir: string, extension: '.schema.ts' | '.schema.json'): Promise<string[]> {
  const requested = getTenantList([]);
  if (requested.length > 0) return requested;

  const files = await readdir(sourceDir);
  return files
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length))
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

async function loadJsonSchema(jsonDir: string, tenant: string): Promise<TenantSchema> {
  const sourcePath = path.join(jsonDir, `${tenant}.schema.json`);
  return JSON.parse(await readFile(sourcePath, 'utf8')) as TenantSchema;
}

function tenantSourceFor(schema: TenantSchema): string {
  return [
    "import { defineTenantSchema } from '../../packages/schema/src/authoring.ts';",
    '',
    `export default defineTenantSchema(${JSON.stringify(schema, null, 2)});`,
    ''
  ].join('\n');
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(`--${flag}`);
}

await main();
