import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const localTsc = process.platform === 'win32'
  ? join('node_modules', '.bin', 'tsc.cmd')
  : join('node_modules', '.bin', 'tsc');
const command = existsSync(localTsc) ? localTsc : 'npx';
const args = existsSync(localTsc) ? ['--noEmit'] : ['--yes', '--package', 'typescript', '--', 'tsc', '--noEmit'];
const tenants = resolveTypecheckTenants();

for (const tenant of tenants) {
  const generate = spawnSync(process.execPath, ['scripts/generate-tenant.ts', '--tenant', tenant], { encoding: 'utf8' });
  process.stdout.write(generate.stdout || '');
  process.stderr.write(generate.stderr || '');
  if (generate.status !== 0) process.exit(generate.status ?? 1);
  console.log(`[typecheck] generated tenant ${tenant}`);

  const child = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  process.stdout.write(child.stdout || '');
  process.stderr.write(child.stderr || '');
  if (child.status !== 0) process.exit(child.status ?? 1);
}

console.log(`[typecheck] PASS tsc --noEmit for tenants: ${tenants.join(', ')}`);

function resolveTypecheckTenants() {
  const explicit = process.env.TYPECHECK_TENANTS ?? process.env.TYPECHECK_TENANT;
  if (explicit) {
    const tenants = explicit.split(',').map((tenant) => tenant.trim()).filter(Boolean);
    if (tenants.length > 0) return tenants;
  }

  const schemaDir = join('schemas', 'tenants');
  if (!existsSync(schemaDir)) return ['app1'];
  const tenants = readdirSync(schemaDir)
    .filter((file) => file.endsWith('.schema.json'))
    .filter((file) => !file.startsWith('invalid-'))
    .map((file) => file.replace(/\.schema\.json$/, ''))
    .sort();
  return tenants.length > 0 ? tenants : ['app1'];
}
