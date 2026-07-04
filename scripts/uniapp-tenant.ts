import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { getArg, requireArg } from './args.ts';

const tenant = requireArg('tenant');
const positionalCommand = process.argv.slice(2).find((arg) => arg === 'dev' || arg === 'build');
const command = getArg('command', getArg('mode', positionalCommand ?? 'dev')) ?? 'dev';
const platform = getArg('platform', 'mp-weixin') ?? 'mp-weixin';
const schemaDir = getArg('schema-dir');
const dryRun = hasFlag('dry-run');
const forwardedArgs = collectForwardedUniArgs(process.argv.slice(2));

if (command !== 'dev' && command !== 'build') {
  throw new Error(`Unsupported --command=${command}. Use --command=dev or --command=build.`);
}

await generateTenant({ tenant, schemaDir, writeUniAppConfig: true });

const commandPlan = uniCommandArgs(command, platform, forwardedArgs);

if (dryRun) {
  console.log(JSON.stringify({
    tenant,
    command,
    platform,
    generatedDir: 'apps/miniapp-template/src/generated',
    generatedUniAppFiles: [
      'apps/miniapp-template/src/pages.json',
      'apps/miniapp-template/src/manifest.json'
    ],
    cwd: 'apps/miniapp-template',
    commandLine: ['node_modules/.bin/uni', ...commandPlan]
  }));
  process.exit(0);
}

console.log(`[uniapp-tenant] generated apps/miniapp-template/src/generated and uni-app config for ${tenant}`);

const uniBin = process.platform === 'win32'
  ? path.resolve('node_modules/.bin/uni.cmd')
  : path.resolve('node_modules/.bin/uni');
const executable = existsSync(uniBin) ? uniBin : 'npx';
const executableArgs = existsSync(uniBin)
  ? commandPlan
  : ['--yes', '--package', '@dcloudio/vite-plugin-uni', '--', 'uni', ...commandPlan];

const child = spawn(executable, executableArgs, {
  cwd: path.resolve('apps/miniapp-template'),
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, TENANT_ID: tenant, UNI_PLATFORM: platform }
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

function uniCommandArgs(selectedCommand: string, selectedPlatform: string, forwarded: string[]): string[] {
  const base = ['-p', selectedPlatform];
  return selectedCommand === 'build'
    ? ['build', ...base, ...forwarded]
    : [...base, ...forwarded];
}

function collectForwardedUniArgs(argv: string[]): string[] {
  const separator = argv.indexOf('--');
  if (separator >= 0) return argv.slice(separator + 1);
  const forwarded: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === 'dev' || arg === 'build') continue;
    if (arg === '--tenant' || arg === '--command' || arg === '--mode' || arg === '--platform' || arg === '--schema-dir') {
      index += 1;
      continue;
    }
    if (arg === '--dry-run') continue;
    if (arg.startsWith('--tenant=') || arg.startsWith('--command=') || arg.startsWith('--mode=') || arg.startsWith('--platform=') || arg.startsWith('--schema-dir=')) continue;
    forwarded.push(arg);
  }
  return forwarded;
}

function hasFlag(name: string): boolean {
  const exact = `--${name}`;
  const prefix = `${exact}=`;
  return process.argv.slice(2).some((arg) => arg === exact || arg.startsWith(prefix));
}
