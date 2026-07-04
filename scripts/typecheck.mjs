import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const generated = spawnSync(process.execPath, ['scripts/generate-tenant.ts', '--tenant=app1'], { encoding: 'utf8' });
process.stdout.write(generated.stdout || '');
process.stderr.write(generated.stderr || '');
if (generated.status !== 0) process.exit(generated.status ?? 1);

const localTsc = process.platform === 'win32'
  ? join('node_modules', '.bin', 'tsc.cmd')
  : join('node_modules', '.bin', 'tsc');
const command = existsSync(localTsc) ? localTsc : 'npx';
const args = existsSync(localTsc) ? ['--noEmit'] : ['--yes', '--package', 'typescript', '--', 'tsc', '--noEmit'];

const generate = spawnSync(process.execPath, ['scripts/generate-tenant.ts', '--tenant', process.env.TYPECHECK_TENANT || 'app1'], { encoding: 'utf8' });
process.stdout.write(generate.stdout || '');
process.stderr.write(generate.stderr || '');
if (generate.status !== 0) process.exit(generate.status ?? 1);

const child = spawnSync(command, args, { encoding: 'utf8', shell: process.platform === 'win32' });
process.stdout.write(child.stdout || '');
process.stderr.write(child.stderr || '');
if (child.status !== 0) process.exit(child.status ?? 1);
console.log('[typecheck] PASS tsc --noEmit');
