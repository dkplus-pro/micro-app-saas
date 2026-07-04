import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const scripts = packageJson.scripts ?? {};
const miniappPackageJson = JSON.parse(await readFile('apps/miniapp-template/package.json', 'utf8'));

test('npm scripts expose a small uni-app mini-program command set', () => {
  assert.deepEqual(Object.keys(scripts), [
    'dev',
    'build',
    'dev:app1',
    'dev:app2',
    'build:app1',
    'build:app2',
    'generate:tenant',
    'build:tenant',
    'batch:build',
    'upload:tenant',
    'release:tenant',
    'validate:schema',
    'build:tools',
    'typecheck',
    'test',
    'lint',
    'guard:artifacts'
  ]);

  assert.match(scripts.dev, /uniapp-tenant/i, 'dev should route through tenant generation before uni-app dev');
  assert.match(scripts.dev, /mp-weixin/i, 'dev should target WeChat mini-program');
  assert.match(scripts.build, /uniapp-tenant/i, 'build should route through tenant generation before uni-app build');
  assert.match(scripts.build, /build/, 'build should build with uni-app CLI');
  assert.match(scripts['dev:app1'], /app1/, 'dev:app1 should select tenant app1');
  assert.match(scripts['build:app1'], /app1/, 'build:app1 should select tenant app1');
  assert.equal(scripts['build:vite'], undefined, 'legacy Vite aliases should stay removed');
  assert.equal(scripts['dev:mp-weixin'], undefined, 'platform detail should not duplicate the main dev command');
  assert.deepEqual(
    Object.keys(scripts).filter((scriptName) => /vite|mp-weixin/i.test(scriptName)),
    [],
    'script names should stay tenant-focused instead of exposing Vite or platform aliases'
  );
});

test('README documents the simplified command surface', async () => {
  const readme = await readFile('README.md', 'utf8');
  const generatedReadme = await readFile('apps/miniapp-template/src/generated/README.md', 'utf8');

  assert.match(readme, /npm run dev -- --tenant=app1/, 'README should document tenant dev command');
  assert.match(readme, /npm run build -- --tenant=app1/, 'README should document tenant build command');
  assert.match(readme, /npm run build:app1/, 'README should document app1 shortcut');
  assert.match(readme, /src\/generated/i, 'README should mention generated tenant output directory');
  assert.match(readme, /src\/pages\.json/i, 'README should mention generated pages.json');
  assert.match(readme, /不要提交|not (?:commit|committed)|local-only/i, 'README should warn generated tenant outputs are local-only');
  assert.doesNotMatch(readme, /npm run (?:dev|build):(?:vite|mp-weixin)/, 'README should not document legacy Vite/platform aliases');
  assert.match(generatedReadme, /npm run dev -- --tenant=app1/, 'generated README placeholder should document tenant dev command');
  assert.match(generatedReadme, /npm run build -- --tenant=app1/, 'generated README placeholder should document tenant build command');
  assert.match(generatedReadme, /home-module-renderer/, 'generated README should document generated homepage renderer');
  assert.match(generatedReadme, /subpackage-module-entry/, 'generated README should document split module entries');
  assert.match(generatedReadme, /module-assets/, 'generated README should document technical module subpackage entry');
  assert.doesNotMatch(generatedReadme, /npm run (?:dev:tenant|vite:build:tenant)/, 'generated README placeholder should not document removed tenant aliases');
});

test('miniapp template package declares uni-app platform dependencies for DCloud CLI plugin discovery', () => {
  assert.equal(miniappPackageJson.dependencies?.['@dcloudio/uni-app'], '3.0.0-5010420260703001');
  assert.equal(miniappPackageJson.devDependencies?.['@dcloudio/uni-mp-weixin'], '3.0.0-5010420260703001');
  assert.equal(miniappPackageJson.devDependencies?.['@dcloudio/vite-plugin-uni'], '3.0.0-5010420260703001');
});
