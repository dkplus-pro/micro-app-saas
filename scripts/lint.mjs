#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const ignore = new Set(['.git', 'node_modules']);
const errors = [];
const files = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (/\.(json|mjs|js|vue|md)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
}

await walk(rootDir);
for (const file of files) {
  const relative = path.relative(rootDir, file);
  const content = await readFile(file, 'utf8');
  if (!content.endsWith('\n')) errors.push(`${relative}: missing trailing newline`);
  if (/[ \t]+$/m.test(content)) errors.push(`${relative}: trailing whitespace`);
  if (file.endsWith('.json')) {
    try {
      JSON.parse(content);
    } catch (error) {
      errors.push(`${relative}: invalid JSON: ${error.message}`);
    }
  }
}

for (const generatedFile of ['src/generated/tenant.js', 'src/generated/routes.js', 'src/generated/module-registry.js']) {
  const content = await readFile(path.join(rootDir, generatedFile), 'utf8').catch(() => '');
  if (!content.startsWith('// AUTO-GENERATED')) errors.push(`${generatedFile}: missing generated banner`);
}

if (errors.length > 0) {
  console.error(`lint: FAIL\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`lint: PASS (${files.length} files checked)`);
