import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { getArg, requireArg } from './args.ts';

const tenant = requireArg('tenant');
const positionalCommand = process.argv.slice(2).find((arg) => arg === 'dev' || arg === 'build');
const command = getArg('command', getArg('mode', positionalCommand ?? 'dev'));
const schemaDir = getArg('schema-dir');
const dryRun = hasFlag('dry-run');
const viteArgs = collectForwardedViteArgs(process.argv.slice(2));

if (command !== 'dev' && command !== 'build') {
  throw new Error(`Unsupported --command=${command}. Use --command=dev or --command=build.`);
}

await generateTenant({ tenant, schemaDir });

if (dryRun) {
  console.log(JSON.stringify({
    tenant,
    mode: command,
    generatedDir: 'apps/miniapp-template/src/generated',
    command: [process.execPath, 'node_modules/vite/bin/vite.js', command]
  }));
  process.exit(0);
}

console.log(`[vite-tenant] generated apps/miniapp-template/src/generated for ${tenant}`);

const viteBin = process.platform === 'win32'
  ? path.resolve('node_modules/.bin/vite.cmd')
  : path.resolve('node_modules/.bin/vite');
const executable = existsSync(viteBin) ? viteBin : 'npx';
const executableArgs = existsSync(viteBin)
  ? viteCommandArgs(command, viteArgs)
  : ['--yes', '--package', 'vite', '--', 'vite', ...viteCommandArgs(command, viteArgs)];

const child = spawn(executable, executableArgs, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, TENANT_ID: tenant }
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

function viteCommandArgs(selectedCommand: string, forwarded: string[]): string[] {
  const base = ['--config', 'apps/miniapp-template/vite.config.ts'];
  return selectedCommand === 'build'
    ? ['build', ...base, ...forwarded]
    : [...base, ...forwarded];
}

function collectForwardedViteArgs(argv: string[]): string[] {
  const separator = argv.indexOf('--');
  if (separator >= 0) return argv.slice(separator + 1);
  const forwarded: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === 'dev' || arg === 'build') continue;
    if (arg === '--tenant' || arg === '--command' || arg === '--mode' || arg === '--schema-dir') {
      index += 1;
      continue;
    }
    if (arg === '--dry-run') continue;
    if (arg.startsWith('--tenant=') || arg.startsWith('--command=') || arg.startsWith('--mode=') || arg.startsWith('--schema-dir=')) continue;
    forwarded.push(arg);
  }
  return forwarded;
}

function hasFlag(name: string): boolean {
  const exact = `--${name}`;
  const prefix = `${exact}=`;
  return process.argv.slice(2).some((arg) => arg === exact || arg.startsWith(prefix));
}
