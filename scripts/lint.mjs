import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const extensions = new Set(['.ts', '.js', '.json', '.vue', '.md', '.yaml']);
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'coverage']);
const failures = [];

function extname(path) {
  const index = path.lastIndexOf('.');
  return index >= 0 ? path.slice(index) : '';
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!extensions.has(extname(path))) continue;
    if (/^build-artifacts\/.*\.json$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    if (/\t/.test(text)) failures.push(`${path}: tab character found`);
    if (/\s+$/m.test(text)) failures.push(`${path}: trailing whitespace found`);
  }
}

walk('.');
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('PASS lint');
