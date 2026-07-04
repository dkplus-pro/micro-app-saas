import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { requireArg } from './args.ts';

const tenant = requireArg('tenant');
const result = await generateTenant({ tenant });
const outDir = path.join(process.cwd(), 'apps/miniapp-template/dist/builds', tenant);
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(result.appConfig, null, 2)}\n`);
await writeFile(path.join(outDir, 'pages.json'), `${JSON.stringify({ pages: result.pagesConfig, tabBar: result.tabbarConfig }, null, 2)}\n`);
await writeFile(path.join(outDir, 'module-entry.ts'), `${result.moduleEntrySource}\n`);
await writeFile(path.join(outDir, 'build-summary.json'), `${JSON.stringify({ tenantId: result.tenantId, pageRoutes: result.pageRoutes, usedModules: result.usedModules }, null, 2)}\n`);
console.log(`PASS build tenant ${tenant}: ${result.pageRoutes.length} pages, ${result.usedModules.length} modules`);
