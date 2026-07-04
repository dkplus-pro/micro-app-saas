import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const localTsc = process.platform === 'win32'
  ? join('node_modules', '.bin', 'tsc.cmd')
  : join('node_modules', '.bin', 'tsc');
const command = existsSync(localTsc) ? localTsc : 'npx';
const args = existsSync(localTsc) ? ['--noEmit'] : ['--yes', '--package', 'typescript', '--', 'tsc', '--noEmit'];

const child = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
process.stdout.write(child.stdout || '');
process.stderr.write(child.stderr || '');
if (child.status !== 0) process.exit(child.status ?? 1);
console.log('[typecheck] PASS tsc --noEmit');
