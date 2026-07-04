import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const files = globSync('**/*.{ts,js,json,vue,md}', {
  exclude: ['node_modules/**', '.git/**', 'build-artifacts/*.json']
});
const failures = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (/\t/.test(text)) failures.push(`${file}: tab character found`);
  if (/\s+$/m.test(text)) failures.push(`${file}: trailing whitespace found`);
}
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS lint checked=${files.length}`);
