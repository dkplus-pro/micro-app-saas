import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const scripts = packageJson.scripts ?? {};
const miniappPackageJson = JSON.parse(await readFile('apps/miniapp-template/package.json', 'utf8'));

test('tenant uni-app npm scripts are wired for generate-before-dev/build workflow', () => {
  for (const scriptName of [
    'generate:tenant',
    'dev:mp-weixin',
    'build:mp-weixin',
    'dev:app1:mp-weixin',
    'build:app1:mp-weixin',
    'dev:tenant',
    'build:vite'
  ]) {
    assert.equal(typeof scripts[scriptName], 'string', `missing npm script ${scriptName}`);
  }

  assert.match(scripts['dev:mp-weixin'], /uniapp-tenant/i, 'dev:mp-weixin should route through tenant generation before uni-app dev');
  assert.match(scripts['dev:mp-weixin'], /mp-weixin/i, 'dev:mp-weixin should target WeChat mini-program');
  assert.match(scripts['build:mp-weixin'], /uniapp-tenant/i, 'build:mp-weixin should route through tenant generation before uni-app build');
  assert.match(scripts['build:mp-weixin'], /build/, 'build:mp-weixin should build with uni-app CLI');
  assert.match(scripts['dev:app1:mp-weixin'], /app1/, 'dev:app1:mp-weixin should select tenant app1');
  assert.match(scripts['build:app1:mp-weixin'], /app1/, 'build:app1:mp-weixin should select tenant app1');
  assert.match(scripts['build:vite'], /build:mp-weixin/, 'legacy Vite alias should build the uni-app mini-program target');
});

test('tenant uni-app docs describe local-only generated artifacts', async () => {
  const readme = await readFile('README.md', 'utf8');

  assert.match(readme, /npm run dev:mp-weixin -- --tenant=app1/, 'README should document tenant uni-app dev command');
  assert.match(readme, /npm run build:mp-weixin -- --tenant=app1/, 'README should document tenant uni-app build command');
  assert.match(readme, /src\/generated/i, 'README should mention generated tenant output directory');
  assert.match(readme, /src\/pages\.json/i, 'README should mention generated pages.json');
  assert.match(readme, /not (?:commit|committed)|local-only/i, 'README should warn generated tenant outputs are local-only');
});

test('miniapp template package declares uni-app platform dependencies for DCloud CLI plugin discovery', () => {
  assert.equal(miniappPackageJson.dependencies?.['@dcloudio/uni-app'], '3.0.0-5010420260703001');
  assert.equal(miniappPackageJson.devDependencies?.['@dcloudio/uni-mp-weixin'], '3.0.0-5010420260703001');
  assert.equal(miniappPackageJson.devDependencies?.['@dcloudio/vite-plugin-uni'], '3.0.0-5010420260703001');
});
