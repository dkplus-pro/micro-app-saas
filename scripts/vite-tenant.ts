import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { parseArgs, requireTenant } from './runner-utils.ts';

type Mode = 'dev' | 'build';

const [rawMode = 'dev', ...rawArgs] = process.argv.slice(2);
if (rawMode !== 'dev' && rawMode !== 'build') {
  throw new Error(`Unknown Vite tenant mode "${rawMode}". Use "dev" or "build".`);
}

const args = parseArgs(rawArgs);
const tenantId = requireTenant(args);
const rootDir = path.resolve(String(args.rootDir || process.cwd()));
const appDir = path.join(rootDir, 'apps', 'miniapp-template');
const schemaDir = path.resolve(rootDir, String(args.schemaDir || 'schemas/tenants'));
const outputDir = path.join(appDir, 'src', 'generated');

await generateTenant({ tenant: tenantId, schemaDir, outputDir });
console.log(`PASS generated tenant ${tenantId}: ${path.relative(rootDir, outputDir)}`);

const viteBin = resolveViteBin(rootDir);
const passthroughArgs = rawArgs.filter((arg, index) => {
  if (arg.startsWith('--tenant') || arg.startsWith('--root-dir') || arg.startsWith('--schema-dir')) return false;
  const previous = rawArgs[index - 1];
  return previous !== '--tenant' && previous !== '--root-dir' && previous !== '--schema-dir';
});
const viteArgs = [rawMode, ...passthroughArgs];
const child = spawnSync(viteBin.command, [...viteBin.args, ...viteArgs], {
  cwd: appDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.exit(child.status ?? 1);

function resolveViteBin(rootDir: string): { command: string; args: string[] } {
  const localBin = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  if (existsSync(localBin)) return { command: localBin, args: [] };
  return { command: 'npx', args: ['--yes', 'vite'] };
}
