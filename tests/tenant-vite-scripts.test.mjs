import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const scripts = packageJson.scripts ?? {};

test('tenant Vite npm scripts are wired for generate-before-dev/build workflow', () => {
  for (const scriptName of ['generate:tenant', 'dev:tenant', 'dev:app1', 'build:vite', 'build:vite:tenant', 'build:vite:app1']) {
    assert.equal(typeof scripts[scriptName], 'string', `missing npm script ${scriptName}`);
  }

  assert.match(scripts['dev:tenant'], /generate|tenant-vite|vite-tenant/i, 'dev:tenant should route through tenant generation before Vite dev');
  assert.match(scripts['dev:tenant'], /vite/i, 'dev:tenant should start Vite dev');
  assert.match(scripts['build:vite'], /build:vite:tenant|generate|tenant-vite|vite-tenant/i, 'build:vite should route through tenant generation before Vite build');
  assert.match(scripts['build:vite:tenant'], /generate|tenant-vite|vite-tenant/i, 'build:vite:tenant should route through tenant generation before Vite build');
  assert.match(scripts['build:vite:tenant'], /vite/i, 'build:vite:tenant should run Vite build');
  assert.match(scripts['dev:app1'], /app1/, 'dev:app1 should select tenant app1');
  assert.match(scripts['build:vite:app1'], /app1/, 'build:vite:app1 should select tenant app1');
});

test('tenant Vite docs describe local-only generated artifacts', async () => {
  const readme = await readFile('README.md', 'utf8');

  assert.match(readme, /npm run dev:tenant -- --tenant=app1/, 'README should document tenant Vite dev command');
  assert.match(readme, /npm run build:vite:tenant -- --tenant=app1/, 'README should document tenant Vite build command');
  assert.match(readme, /src\/generated/i, 'README should mention generated tenant output directory');
  assert.match(readme, /not (?:commit|committed)|local-only/i, 'README should warn generated tenant outputs are local-only');
});
