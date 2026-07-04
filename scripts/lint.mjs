import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const files = ['scripts', 'tests'].flatMap((root) => walk(root)).filter((file) => /\.(ts|mjs)$/.test(file));
const problems = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (text.includes('\t')) problems.push(`${file}: contains tab indentation`);
  if (/console\.log\([^`'"{]/.test(text)) problems.push(`${file}: use structured/string console output`);
  if (text.includes('TODO')) problems.push(`${file}: contains TODO`);
}
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`[lint] PASS ${files.length} files`);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}
