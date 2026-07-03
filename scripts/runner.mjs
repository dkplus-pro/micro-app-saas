#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateTenant, listTenantIds } from './lib/generator.mjs';

const rootDir = process.cwd();
const args = process.argv.slice(2);
const tenants = args.includes('--all') ? await listTenantIds(rootDir) : args.filter((arg) => !arg.startsWith('--'));
const selectedTenants = tenants.length > 0 ? tenants : [process.env.TENANT ?? 'app1'];
const records = [];

for (const tenantId of selectedTenants) {
  try {
    const snapshotRoot = path.join(rootDir, 'dist/tenants', tenantId);
    const result = await generateTenant({ tenantId, rootDir, writeRoot: tenantId === selectedTenants[0], snapshotRoot });
    records.push({
      tenantId,
      status: 'success',
      schemaVersion: result.tenant.schemaVersion,
      configHash: result.configHash,
      artifactPath: path.relative(rootDir, snapshotRoot),
      uploadResult: 'skipped-local-runner'
    });
  } catch (error) {
    records.push({ tenantId, status: 'failed', error: error.message });
  }
}

await mkdir(path.join(rootDir, 'dist'), { recursive: true });
await writeFile(path.join(rootDir, 'dist/runner-report.json'), `${JSON.stringify({ generatedAt: new Date(0).toISOString(), records }, null, 2)}\n`);

const failed = records.filter((record) => record.status === 'failed');
console.log(JSON.stringify({ records }, null, 2));
if (failed.length > 0) {
  process.exitCode = 1;
}
