import { spawnSync } from 'node:child_process';

const result = spawnSync('git', ['ls-files', 'node_modules/*'], { encoding: 'utf8' });

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'git ls-files node_modules/* failed\n');
  process.exit(result.status ?? 1);
}

const trackedFiles = result.stdout
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (trackedFiles.length > 0) {
  console.error('FAIL tracked node_modules files found:');
  console.error(trackedFiles.slice(0, 20).join('\n'));
  if (trackedFiles.length > 20) {
    console.error(`...and ${trackedFiles.length - 20} more`);
  }
  console.error('Run: git rm -r --cached node_modules');
  process.exit(1);
}

console.log('PASS no tracked node_modules files');
