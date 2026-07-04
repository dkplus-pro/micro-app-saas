import { spawnSync } from 'node:child_process';
import { readListArg } from './args.js';

const tenants = readListArg('tenants', ['app1', 'app2']);
const results = tenants.map((tenant) => {
  const child = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/build-tenant.ts', `--tenant=${tenant}`], {
    encoding: 'utf8'
  });
  process.stdout.write(child.stdout);
  process.stderr.write(child.stderr);
  return { tenant, status: child.status === 0 ? 'success' : 'failed', error: child.status === 0 ? undefined : child.stderr };
});
console.log(JSON.stringify({ results }, null, 2));
if (results.some((result) => result.status === 'failed')) process.exit(1);
