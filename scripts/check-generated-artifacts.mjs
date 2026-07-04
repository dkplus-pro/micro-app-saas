import { spawnSync } from 'node:child_process';

const generatedRoot = 'apps/miniapp-template/src/generated';
const allowedTracked = new Set([`${generatedRoot}/README.md`]);
const forbiddenExtensions = /\.(?:ts|json)$/;

const ls = spawnSync('git', ['ls-files', '-z', generatedRoot], { encoding: 'utf8' });
if (ls.status !== 0) {
  process.stderr.write(ls.stderr || 'git ls-files failed');
  process.exit(ls.status ?? 1);
}

const tracked = ls.stdout.split('\0').filter(Boolean);
const forbidden = tracked.filter((file) => !allowedTracked.has(file) || forbiddenExtensions.test(file));
if (forbidden.length > 0) {
  console.error(`Generated tenant outputs must not be tracked:\n${forbidden.map((file) => `- ${file}`).join('\n')}`);
  console.error('Run git rm --cached for generated TS/JSON outputs and regenerate them locally when needed.');
  process.exit(1);
}

const ignoredCandidates = [
  `${generatedRoot}/tenant.config.ts`,
  `${generatedRoot}/build-summary.json`,
  'apps/miniapp-template/src/pages.json',
  'apps/miniapp-template/src/manifest.json',
  'apps/miniapp-template/dist/build/mp-weixin/app.js',
  'apps/miniapp-template/.vite/deps/_metadata.json',
  '.runner-records/app1.release-record.json',
  'dist/scripts/generate-tenant.js',
  'node_modules/.vite'
];
const notIgnored = ignoredCandidates.filter((file) => {
  const ignored = spawnSync('git', ['check-ignore', '-q', file], { encoding: 'utf8' });
  return ignored.status !== 0;
});
if (notIgnored.length > 0) {
  console.error('Expected generated/build output paths to be ignored by git.');
  console.error(`Not ignored:\n${notIgnored.map((file) => `- ${file}`).join('\n')}`);
  process.exit(1);
}

console.log('PASS generated artifact guard');
