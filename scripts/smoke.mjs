#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pages = JSON.parse(await readFile('pages.json', 'utf8'));
const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const runtime = JSON.parse(await readFile('src/generated/runtime-config.json', 'utf8'));
const metadata = JSON.parse(await readFile('src/generated/metadata.json', 'utf8'));

assert.equal(runtime.tenantId, 'app1');
assert.deepEqual(pages.pages.map((page) => page.path), ['pages/a/index', 'pages/b/index', 'pages/c/index']);
assert.deepEqual(pages.tabBar.list.map((tab) => tab.text), ['A', 'B', 'C']);
assert.equal(pages.pages[0].style.navigationBarTitleText, 'App1 首页');
assert.deepEqual(runtime.layouts.B.modules.map((module) => module.moduleId), ['a', 'b', 'c', 'd']);
assert.equal(manifest['mp-weixin'].appid, 'wx-app1-placeholder');
assert.equal(metadata.configHash, runtime.configHash);
console.log('smoke: PASS (App1 pages/tabs/title/modules/manifest/hash verified)');
