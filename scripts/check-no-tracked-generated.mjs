import { spawnSync } from 'node:child_process';

const generatedRoot = 'apps/miniapp-template/src/generated';
const allowedTracked = new Set([`${generatedRoot}/README.md`, `${generatedRoot}/.gitkeep`]);

const child = spawnSync('git', ['ls-files', `${generatedRoot}/*`], { encoding: 'utf8' });
if (child.status !== 0) {
  process.stderr.write(child.stderr || 'git ls-files failed while checking generated tenant artifacts\n');
  process.exit(child.status ?? 1);
}

const trackedGeneratedArtifacts = child.stdout
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((file) => !allowedTracked.has(file));

if (trackedGeneratedArtifacts.length > 0) {
  console.error([
    'Generated tenant artifacts must not be tracked. Regenerate them locally instead of committing them:',
    ...trackedGeneratedArtifacts.map((file) => `- ${file}`),
  ].join('\n'));
  process.exit(1);
}

console.log('PASS no tracked generated tenant artifacts');
