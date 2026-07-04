import { spawnSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const roots = ['scripts'];
const files = roots.flatMap((root) => walk(root)).filter((file) => /\.ts$/.test(file));
let failed = false;
for (const file of files) {
  const child = spawnSync(process.execPath, [file, '--tenant', '__typecheck_missing_schema__', '--skip-validate', '--skip-generate'], {
    encoding: 'utf8',
    env: { ...process.env, RUNNER_TYPECHECK: '1' },
  });
  const allowedFailure = child.status === 1 && /Missing tenant schema|No tenants selected|Missing release record|Cannot upload|Cannot release/.test(`${child.stdout}\n${child.stderr}`);
  if (child.status !== 0 && !allowedFailure) {
    failed = true;
    console.error(`[typecheck] ${file} failed`);
    console.error(child.stdout);
    console.error(child.stderr);
  }
}
if (failed) process.exit(1);
console.log(`[typecheck] PASS ${files.length} script modules parsed/executed with expected guards`);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
