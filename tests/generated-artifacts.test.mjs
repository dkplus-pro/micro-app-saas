import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const generatedGlob = 'apps/miniapp-template/src/generated/*';
const allowedTracked = new Set(['apps/miniapp-template/src/generated/README.md']);

test('generated tenant artifacts are not tracked', () => {
  const files = run('git', ['ls-files', generatedGlob]).stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  assert.deepEqual(files.filter((file) => !allowedTracked.has(file)), []);
});

test('generated tenant artifacts and Vite outputs are ignored', () => {
  const paths = [
    'apps/miniapp-template/src/generated/tenant.config.ts',
    'apps/miniapp-template/src/generated/build-summary.json',
    'apps/miniapp-template/dist/assets/app.js',
    'apps/miniapp-template/.vite/deps/vue.js',
    '.runner-records/app1.release-record.json'
  ];
  const ignored = run('git', ['check-ignore', ...paths]).stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  assert.deepEqual(ignored, paths);
});

test('guard rejects tracked generated artifacts if any are reintroduced', () => {
  const result = run(process.execPath, ['scripts/check-no-tracked-generated.mjs']);
  assert.match(result.stdout, /PASS no tracked generated tenant artifacts/);
});

function run(command, args) {
  const child = spawnSync(command, args, { encoding: 'utf8' });
  assert.equal(child.status, 0, `${command} ${args.join(' ')} failed\nSTDOUT:${child.stdout}\nSTDERR:${child.stderr}`);
  return child;
}
