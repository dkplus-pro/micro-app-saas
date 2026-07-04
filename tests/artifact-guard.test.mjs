import test from 'node:test';
import assert from 'node:assert/strict';
import { findDisallowedTrackedArtifacts } from '../scripts/check-no-tracked-artifacts.mjs';

test('artifact guard rejects tracked generated tenant files and local outputs', () => {
  const offenders = findDisallowedTrackedArtifacts([
    'apps/miniapp-template/src/generated/tenant.config.ts',
    'apps/miniapp-template/src/generated/build-summary.json',
    'apps/miniapp-template/src/generated/README.md',
    'apps/miniapp-template/src/pages.json',
    'apps/miniapp-template/src/manifest.json',
    'apps/miniapp-template/dist/build/mp-weixin/app.js',
    '.runner-records/app1.release-record.json',
    'node_modules/vite/package.json',
    'schemas/tenants/invalid-module.schema.json',
    'src/source-file.ts'
  ]);

  assert.deepEqual(offenders, [
    'apps/miniapp-template/src/generated/tenant.config.ts',
    'apps/miniapp-template/src/generated/build-summary.json',
    'apps/miniapp-template/src/pages.json',
    'apps/miniapp-template/src/manifest.json',
    'apps/miniapp-template/dist/build/mp-weixin/app.js',
    '.runner-records/app1.release-record.json',
    'node_modules/vite/package.json',
    'schemas/tenants/invalid-module.schema.json'
  ]);
});
