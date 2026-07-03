#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const checked = [];
const errors = [];
const ignore = new Set(['.git', '.omx', 'node_modules', 'dist']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (/\.(mjs|js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', fullPath], { encoding: 'utf8' });
      if (result.status !== 0) {
        errors.push(`${path.relative(rootDir, fullPath)}:\n${result.stderr || result.stdout}`);
      } else {
        checked.push(path.relative(rootDir, fullPath));
      }
    }
  }
}

await walk(rootDir);
if (errors.length > 0) {
  console.error(`typecheck: FAIL\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`typecheck: PASS (${checked.length} JavaScript modules checked with node --check)`);
