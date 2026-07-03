import { readFile } from 'node:fs/promises';

const files = process.argv.slice(2);
if (files.length === 0) {
  throw new Error('Usage: node scripts/lint-generated.mjs <files...>');
}
const generatedJsonFiles = files.filter((file) => file.endsWith('.json') && (file.startsWith('src/generated/') || file === 'pages.json' || file === 'manifest.json'));
for (const file of files) {
  const text = await readFile(file, 'utf8');
  if (!text.endsWith('\n')) {
    throw new Error(`${file} must end with a newline`);
  }
  if (file.endsWith('.json')) {
    JSON.parse(text);
  }
}
for (const file of generatedJsonFiles) {
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  const hasGeneratedMarker = parsed._generated || parsed.generated;
  if (!hasGeneratedMarker) {
    throw new Error(`${file} is missing generated marker`);
  }
}
console.log(`linted ${files.length} files`);
