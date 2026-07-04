import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve('.');
const generatedRoot = 'apps/miniapp-template/src/generated';
const allowedTracked = new Set([`${generatedRoot}/README.md`, `${generatedRoot}/.gitkeep`]);

function run(command, args) {
  const child = spawnSync(command, args, { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(child.status, 0, `${command} ${args.join(' ')} failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}

test('generated tenant artifacts are ignored and not tracked', () => {
  const tracked = run('git', ['ls-files', `${generatedRoot}/*`]).stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => !allowedTracked.has(file));

  assert.deepEqual(tracked, []);

  const ignored = run('git', ['check-ignore', `${generatedRoot}/tenant.config.ts`, `${generatedRoot}/build-summary.json`]).stdout
    .split('\n')
    .filter(Boolean)
    .sort();

  assert.deepEqual(ignored, [
    `${generatedRoot}/build-summary.json`,
    `${generatedRoot}/tenant.config.ts`,
  ]);
});

test('Vite tenant wrapper generates before running the Vite command', () => {
  const child = run(process.execPath, ['scripts/vite-tenant.ts', '--tenant=app1', '--mode=build', '--dry-run']);
  const plan = JSON.parse(child.stdout);

  assert.equal(plan.tenant, 'app1');
  assert.equal(plan.mode, 'build');
  assert.equal(plan.generatedDir, generatedRoot);
  assert.deepEqual(plan.command.slice(-2), ['node_modules/vite/bin/vite.js', 'build']);
  assert.equal(existsSync(path.join(repoRoot, generatedRoot, 'tenant.config.ts')), true);
});
