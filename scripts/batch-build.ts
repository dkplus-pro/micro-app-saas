import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.js';
import { getTenantList } from './args.js';

interface BuildRecord {
  tenantId: string;
  buildStatus: 'success' | 'failed';
  errorMessage?: string;
  finishedAt: string;
}

const records: BuildRecord[] = [];
for (const tenant of getTenantList()) {
  try {
    const result = await generateTenant({ tenant });
    const outDir = path.join(process.cwd(), 'apps/miniapp-template/dist/builds', tenant);
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, 'build-summary.json'), `${JSON.stringify({ tenantId: result.tenantId, pageRoutes: result.pageRoutes, usedModules: result.usedModules }, null, 2)}\n`);
    records.push({ tenantId: tenant, buildStatus: 'success', finishedAt: new Date().toISOString() });
    console.log(`PASS batch build ${tenant}`);
  } catch (error) {
    records.push({ tenantId: tenant, buildStatus: 'failed', errorMessage: error instanceof Error ? error.message : String(error), finishedAt: new Date().toISOString() });
    console.error(`FAIL batch build ${tenant}`);
  }
}
await mkdir(path.join(process.cwd(), 'apps/miniapp-template/dist'), { recursive: true });
await writeFile(path.join(process.cwd(), 'apps/miniapp-template/dist/release-records.json'), `${JSON.stringify(records, null, 2)}\n`);
if (records.some((record) => record.buildStatus === 'failed')) process.exitCode = 1;
