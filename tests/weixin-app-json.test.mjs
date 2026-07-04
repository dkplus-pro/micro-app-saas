import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { ensureWeixinDevtoolsAppJsonCompat } from '../scripts/weixin-app-json.ts';

test('WeChat app.json compat patch adds an empty subPackages array when uni-app omits it', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'mp-weixin-app-json-'));
  try {
    await writeFile(path.join(dir, 'app.json'), JSON.stringify({
      pages: ['pages/page-a/index'],
      tabBar: { list: [{ pagePath: 'pages/page-a/index', text: 'A' }] }
    }));

    const result = await ensureWeixinDevtoolsAppJsonCompat(dir);
    const appJson = JSON.parse(await readFile(path.join(dir, 'app.json'), 'utf8'));

    assert.equal(result.changed, true);
    assert.deepEqual(appJson.subPackages, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('WeChat app.json compat patch preserves existing subPackages', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'mp-weixin-app-json-'));
  const existing = [{ root: 'pages/page-d', pages: ['index'] }];
  try {
    await writeFile(path.join(dir, 'app.json'), JSON.stringify({
      pages: ['pages/page-a/index'],
      subPackages: existing
    }));

    const result = await ensureWeixinDevtoolsAppJsonCompat(dir);
    const appJson = JSON.parse(await readFile(path.join(dir, 'app.json'), 'utf8'));

    assert.equal(result.changed, false);
    assert.deepEqual(appJson.subPackages, existing);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
