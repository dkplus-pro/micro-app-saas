import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('route pages render business content directly instead of a top-level biz-page wrapper', () => {
  const pageA = readFileSync('apps/miniapp-template/src/pages/page-a/index.vue', 'utf8');
  const pageB = readFileSync('apps/miniapp-template/src/pages/page-b/index.vue', 'utf8');

  assert.doesNotMatch(pageA, /<BizPage\b/);
  assert.doesNotMatch(pageB, /<BizPage\b/);
  assert.doesNotMatch(pageA, /:modules=/);
  assert.doesNotMatch(pageB, /:modules=/);
  assert.match(pageA, /page-a__asset-image/);
  assert.match(pageA, /HomeModuleRenderer/);
  assert.match(pageB, /StreamModuleRenderer/);
  assert.match(pageB, /usePageBController/);
});

test('miniapp entry keeps createSSRApp in the real entry so uni-mp-vite injects app mount', () => {
  const mainEntry = readFileSync('apps/miniapp-template/src/main.ts', 'utf8');

  assert.match(mainEntry, /import\s+\{\s*createSSRApp\s*\}\s+from\s+['"]vue['"]/);
  assert.match(mainEntry, /export\s+function\s+createApp\s*\(/);
  assert.match(mainEntry, /createTenantShellApp\s*\(\s*createSSRApp\s*\)/);
  assert.doesNotMatch(mainEntry, /export\s+\{\s*createApp\s*\}\s+from/);
});
