import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { parseArgs, requireTenant } from './runner-utils.ts';

const rawArgs = process.argv.slice(2);
const separatorIndex = rawArgs.indexOf('--');
const scriptArgs = separatorIndex >= 0 ? rawArgs.slice(0, separatorIndex) : rawArgs;
const vitePassthroughArgs = separatorIndex >= 0 ? rawArgs.slice(separatorIndex + 1) : [];
const args = parseArgs(scriptArgs);
const tenant = requireTenant(args);
const mode = String(args.mode || args._ || 'dev');
if (mode !== 'dev' && mode !== 'build') {
  throw new Error(`Invalid mode "${mode}". Use --mode=dev or --mode=build.`);
}

const rootDir = path.resolve(String(args.rootDir || process.cwd()));
const appDir = path.join(rootDir, 'apps/miniapp-template');
const generatedDir = path.join(appDir, 'src/generated');
const schemaDir = path.resolve(rootDir, String(args.schemaDir || 'schemas/tenants'));

await generateTenant({ tenant, schemaDir, outputDir: generatedDir });

const viteBin = path.join(rootDir, 'node_modules/vite/bin/vite.js');
const viteArgs = mode === 'build' ? ['build', ...vitePassthroughArgs] : [...vitePassthroughArgs];
const command = [process.execPath, path.relative(rootDir, viteBin), ...viteArgs];

if (args.dryRun) {
  console.log(JSON.stringify({
    tenant,
    mode,
    generatedDir: path.relative(rootDir, generatedDir),
    cwd: path.relative(rootDir, appDir),
    command,
  }, null, 2));
  process.exit(0);
}

const child = spawnSync(process.execPath, [viteBin, ...viteArgs], {
  cwd: appDir,
  stdio: 'inherit',
  env: { ...process.env, TENANT_ID: tenant },
});

if (child.error) throw child.error;
process.exit(child.status ?? 1);
