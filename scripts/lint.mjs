import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['packages', 'scripts', 'tests', 'apps/miniapp-template/src', 'schemas'];
const allowed = new Set(['.ts', '.js', '.mjs', '.json', '.vue', '.yaml', '.yml']);
const errors = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!allowed.has(path.extname(entry.name))) continue;
    const text = await readFile(full, 'utf8');
    if (!text.endsWith('\n')) errors.push(`${full}: missing final newline`);
    text.split('\n').forEach((line, index) => {
      if (/\s+$/.test(line)) errors.push(`${full}:${index + 1}: trailing whitespace`);
    });
  }
}

for (const root of roots) {
  await walk(root);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('PASS lint: whitespace/final-newline checks');
