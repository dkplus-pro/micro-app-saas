import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readArg } from './args.js';

const tenant = readArg('tenant', 'app1');
const artifactPath = resolve('build-artifacts', `${tenant}.build.json`);
const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
artifact.auditStatus = 'dry_run_success';
artifact.releaseStatus = 'dry_run_success';
artifact.finishedAt = new Date().toISOString();
await writeFile(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`PASS release:tenant tenant=${tenant} mode=dry-run`);
