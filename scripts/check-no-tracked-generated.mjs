import { spawnSync } from 'node:child_process';

const allowed = new Set(['apps/miniapp-template/src/generated/README.md']);
const result = spawnSync('git', ['ls-files', 'apps/miniapp-template/src/generated/*'], { encoding: 'utf8' });

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'git ls-files apps/miniapp-template/src/generated/* failed\n');
  process.exit(result.status ?? 1);
}

const trackedFiles = result.stdout
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => !allowed.has(file));

if (trackedFiles.length > 0) {
  console.error('FAIL tracked generated tenant artifacts found:');
  console.error(trackedFiles.slice(0, 20).join('\n'));
  if (trackedFiles.length > 20) {
    console.error(`...and ${trackedFiles.length - 20} more`);
  }
  console.error('Run: git rm --cached apps/miniapp-template/src/generated/<generated files>');
  process.exit(1);
}

console.log('PASS no tracked generated tenant artifacts');
