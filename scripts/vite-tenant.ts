import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { parseArgs, requireTenant } from './runner-utils.ts';

const [command = 'dev', ...argv] = process.argv.slice(2);
if (command !== 'dev' && command !== 'build') {
  throw new Error(`Unsupported Vite tenant command "${command}". Use "dev" or "build".`);
}

const args = parseArgs(argv);
const rootDir = path.resolve(String(args.rootDir || process.cwd()));
const tenant = requireTenant(args);
const schemaDir = path.resolve(rootDir, String(args.schemaDir || 'schemas/tenants'));
const outputDir = path.resolve(rootDir, 'apps/miniapp-template/src/generated');

await generateTenant({ tenant, schemaDir, outputDir });
console.log(`PASS generated tenant ${tenant}: ${path.relative(rootDir, outputDir)}`);

const viteBin = process.platform === 'win32'
  ? path.join(rootDir, 'node_modules', '.bin', 'vite.cmd')
  : path.join(rootDir, 'node_modules', '.bin', 'vite');
const configPath = path.join(rootDir, 'apps/miniapp-template/vite.config.ts');
const viteArgs = [command, '--config', configPath, ...stripWrapperArgs(argv)];
const child = spawnSync(viteBin, viteArgs, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.exit(child.status ?? 1);

function stripWrapperArgs(values: string[]): string[] {
  const stripped: string[] = [];
  const namesWithValues = new Set(['--tenant', '--root-dir', '--schema-dir']);
  const inlinePrefixes = ['--tenant=', '--root-dir=', '--schema-dir='];

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (inlinePrefixes.some((prefix) => value.startsWith(prefix))) continue;
    if (namesWithValues.has(value)) {
      index += 1;
      continue;
    }
    stripped.push(value);
  }
  return stripped;
}
