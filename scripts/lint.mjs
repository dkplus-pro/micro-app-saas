import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const extensions = new Set(['.ts', '.mjs', '.js', '.json', '.vue', '.md', '.yaml']);
const ignoredDirs = new Set(['.git', '.omx', 'node_modules', 'dist', 'coverage']);
const failures = [];

function extname(file) {
  const index = file.lastIndexOf('.');
  return index >= 0 ? file.slice(index) : '';
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const file = join(dir, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) {
      walk(file);
      continue;
    }
    if (!extensions.has(extname(file))) continue;
    if (/^(apps\/miniapp-template\/dist|\.runner-records)\//.test(file)) continue;
    const text = readFileSync(file, 'utf8');
    if (/\t/.test(text)) failures.push(`${file}: tab character found`);
    if (/[^\S\r\n]+$/m.test(text)) failures.push(`${file}: trailing whitespace found`);
    if (text.includes('T' + 'ODO')) failures.push(`${file}: contains placeholder marker`);
  }
}

walk('.');
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('PASS lint');
