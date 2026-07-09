import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve('.');
const generatedRoot = 'apps/miniapp-template/src/generated';
const generatedPagesJson = 'apps/miniapp-template/src/pages.json';
const generatedManifestJson = 'apps/miniapp-template/src/manifest.json';
const generatedModuleAssetsEntry = 'apps/miniapp-template/src/pages/module-assets/module-entry.ts';
const allowedTracked = new Set([`${generatedRoot}/README.md`, `${generatedRoot}/.gitkeep`]);

function run(command, args) {
  const child = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(child.status, 0, `${command} ${args.join(' ')} failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}

test('generated tenant artifacts are ignored and not tracked', () => {
  const tracked = run('git', ['ls-files', `${generatedRoot}/*`, generatedPagesJson, generatedManifestJson, generatedModuleAssetsEntry]).stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => !allowedTracked.has(file));

  assert.deepEqual(tracked, []);

  const ignored = run('git', ['check-ignore', `${generatedRoot}/tenant.config.ts`, `${generatedRoot}/build-summary.json`, generatedPagesJson, generatedManifestJson, generatedModuleAssetsEntry]).stdout
    .split('\n')
    .filter(Boolean)
    .sort();

  assert.deepEqual(ignored, [
    generatedManifestJson,
    generatedModuleAssetsEntry,
    generatedPagesJson,
    `${generatedRoot}/build-summary.json`,
    `${generatedRoot}/tenant.config.ts`,
  ].sort());
});

test('uni-app tenant wrapper generates tenant code and mini-program config before command', () => {
  const child = run(process.execPath, ['scripts/uniapp-tenant.ts', '--tenant=app1', '--command=build', '--platform=mp-weixin', '--dry-run']);
  const plan = JSON.parse(child.stdout);

  assert.equal(plan.tenant, 'app1');
  assert.equal(plan.command, 'build');
  assert.equal(plan.platform, 'mp-weixin');
  assert.equal(plan.generatedDir, generatedRoot);
  assert.deepEqual(plan.generatedUniAppFiles, [generatedPagesJson, generatedManifestJson]);
  assert.deepEqual(plan.commandLine, ['node_modules/.bin/uni', 'build', '-p', 'mp-weixin']);
  assert.equal(existsSync(path.join(repoRoot, generatedRoot, 'tenant.config.ts')), true);
  assert.equal(existsSync(path.join(repoRoot, generatedPagesJson)), true);
  assert.equal(existsSync(path.join(repoRoot, generatedManifestJson)), true);
});
