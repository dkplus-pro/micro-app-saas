import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['packages', 'scripts', 'tests', 'apps/miniapp-template/src'];
const issues = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(ts|js|mjs|json)$/.test(entry.name)) {
      const text = await readFile(full, 'utf8');
      if (text.includes('\t')) issues.push(`${full}: tab character`);
      if (!text.endsWith('\n')) issues.push(`${full}: missing trailing newline`);
    }
  }
}
for (const root of roots) await walk(path.join(process.cwd(), root));
if (issues.length) {
  console.error(issues.join('\n'));
  process.exit(1);
}
console.log(`PASS lint ${roots.join(', ')}`);
