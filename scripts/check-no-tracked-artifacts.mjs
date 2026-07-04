import { spawnSync } from 'node:child_process';

export const ALLOWED_GENERATED_FILES = new Set([
  'apps/miniapp-template/src/generated/README.md',
  'apps/miniapp-template/src/generated/.gitkeep'
]);

export function findDisallowedTrackedArtifacts(paths) {
  return paths.filter((file) => {
    if (file === 'node_modules' || file.startsWith('node_modules/') || file.includes('/node_modules/')) return true;
    if (file === '.runner-records' || file.startsWith('.runner-records/')) return true;
    if (file === 'dist' || file.startsWith('dist/')) return true;
    if (file === 'apps/miniapp-template/dist' || file.startsWith('apps/miniapp-template/dist/')) return true;
    if (file === 'apps/miniapp-template/src/pages.json' || file === 'apps/miniapp-template/src/manifest.json') return true;
    if (file === 'apps/miniapp-template/src/pages/module-assets/module-entry.ts') return true;
    if (/^apps\/miniapp-template\/vite\.config\.ts\.timestamp-.+\.mjs$/.test(file)) return true;
    if (file.startsWith('apps/miniapp-template/src/generated/')) return !ALLOWED_GENERATED_FILES.has(file);
    if (/^schemas\/tenants\/invalid-.+\.schema\.json$/.test(file)) return true;
    return false;
  });
}

function gitLsFiles() {
  const child = spawnSync('git', ['ls-files'], { encoding: 'utf8' });
  if (child.status !== 0) {
    process.stderr.write(child.stderr || 'git ls-files failed\n');
    process.exit(child.status ?? 1);
  }
  return child.stdout.split('\n').filter(Boolean);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const offenders = findDisallowedTrackedArtifacts(gitLsFiles());
  if (offenders.length > 0) {
    console.error(`Tracked local/generated artifacts are not allowed:\n${offenders.map((file) => `- ${file}`).join('\n')}`);
    process.exit(1);
  }
  console.log('PASS no tracked local/generated artifacts');
}
