import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateTenant } from '../packages/generator/src/generateTenant.js';
import { readArg } from './args.js';

const tenant = readArg('tenant', 'app1');
const generated = await generateTenant({ tenant });
await mkdir('build-artifacts', { recursive: true });
const artifact = {
  tenantId: generated.tenant.tenantId,
  appKey: generated.app.appKey,
  appid: generated.app.appid,
  version: generated.app.version,
  buildStatus: 'success',
  uploadStatus: 'not_requested',
  auditStatus: 'not_requested',
  releaseStatus: 'not_requested',
  includedPages: generated.pages.map((page) => page.key),
  includedRoutes: generated.pages.map((page) => page.route),
  includedModules: generated.modules,
  createdAt: new Date().toISOString()
};
await writeFile(resolve('build-artifacts', `${tenant}.build.json`), `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`PASS build:tenant tenant=${tenant} pages=${artifact.includedPages.join(',')} modules=${artifact.includedModules.join(',')}`);
