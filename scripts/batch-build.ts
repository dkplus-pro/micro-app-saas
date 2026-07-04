import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_ROOT, parseArgs } from './runner-utils.ts';

const args = parseArgs(process.argv.slice(2));
const rootDir = path.resolve(String(args.rootDir || DEFAULT_ROOT));
const schemaDir = path.resolve(rootDir, String(args.schemaDir || 'schemas/tenants'));
const explicitTenants = String(args.tenants || args.tenant || args._ || '')
  .split(',')
  .map((tenant) => tenant.trim())
  .filter(Boolean);
const tenants = explicitTenants.length > 0 ? explicitTenants : discoverTenants(schemaDir);

if (tenants.length === 0) {
  console.error('No tenants selected. Use --tenants app1,app2 or add schemas/tenants/*.schema.json.');
  process.exit(1);
}

const results = tenants.map((tenantId) => {
  const child = spawnSync(process.execPath, [path.join(rootDir, 'scripts/build-tenant.ts'), '--tenant', tenantId, '--root-dir', rootDir], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  return {
    tenantId,
    status: child.status === 0 ? 'success' : 'failed',
    exitCode: child.status,
    stdout: child.stdout,
    stderr: child.stderr,
  };
});

const summary = {
  total: results.length,
  success: results.filter((result) => result.status === 'success').map((result) => result.tenantId),
  failed: results.filter((result) => result.status === 'failed').map((result) => ({
    tenantId: result.tenantId,
    exitCode: result.exitCode,
    stderr: result.stderr.trim(),
  })),
  results,
};

console.log(JSON.stringify(summary, null, 2));
if (summary.failed.length > 0) process.exitCode = 1;

function discoverTenants(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.schema.json'))
    .map((file) => file.replace(/\.schema\.json$/, ''))
    .sort();
}
