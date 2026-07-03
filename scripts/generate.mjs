#!/usr/bin/env node
import { generateTenant } from './lib/generator.mjs';

function parseTenant(argv) {
  const index = argv.indexOf('--tenant');
  if (index >= 0) return argv[index + 1];
  const equalsArg = argv.find((arg) => arg.startsWith('--tenant='));
  if (equalsArg) return equalsArg.slice('--tenant='.length);
  return process.env.TENANT ?? 'app1';
}

const tenantId = parseTenant(process.argv.slice(2));
const result = await generateTenant({ tenantId, rootDir: process.cwd(), writeRoot: true });
console.log(JSON.stringify({ tenantId, configHash: result.configHash, snapshotDir: result.snapshotDir }, null, 2));
