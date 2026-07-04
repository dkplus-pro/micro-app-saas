import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const generatedPrefix = 'apps/miniapp-template/src/generated/';
const allowedGeneratedTrackedFiles = new Set([
  `${generatedPrefix}README.md`,
]);

async function git(args) {
  const result = await execFileAsync('git', args, { cwd: repoRoot });
  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

test('generated tenant source outputs are not tracked in git', async () => {
  const trackedGeneratedFiles = await git(['ls-files', `${generatedPrefix}*`, 'apps/miniapp-template/src/pages.json', 'apps/miniapp-template/src/manifest.json']);
  const disallowedGeneratedFiles = trackedGeneratedFiles.filter((file) => !allowedGeneratedTrackedFiles.has(file));

  assert.deepEqual(
    disallowedGeneratedFiles,
    [],
    `generated tenant outputs must stay local-only; untrack with git rm --cached: ${disallowedGeneratedFiles.join(', ')}`
  );
});

test('gitignore keeps tenant generated files and transient build outputs local', async () => {
  const gitignore = await readFile('.gitignore', 'utf8');

  assert.match(gitignore, /apps\/miniapp-template\/src\/generated\//, 'missing generated source ignore pattern');
  assert.match(gitignore, /apps\/miniapp-template\/src\/pages\.json/, 'missing generated pages.json ignore pattern');
  assert.match(gitignore, /apps\/miniapp-template\/src\/manifest\.json/, 'missing generated manifest.json ignore pattern');
  assert.match(gitignore, /apps\/miniapp-template\/dist\//, 'missing miniapp build output ignore pattern');
  assert.match(gitignore, /(?:^|\n)\.runner-records\//, 'missing runner records ignore pattern');
  assert.match(gitignore, /(?:^|\n)node_modules\//, 'missing dependency output ignore pattern');
});
