import { spawnSync } from 'node:child_process';

const child = spawnSync('pnpm', ['exec', 'tsc', '--noEmit'], { encoding: 'utf8' });
process.stdout.write(child.stdout || '');
process.stderr.write(child.stderr || '');
if (child.status !== 0) process.exit(child.status ?? 1);
console.log('[typecheck] PASS tsc --noEmit');
