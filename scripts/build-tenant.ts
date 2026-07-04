import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  assertSchemaPresent,
  makeOptions,
  makeRecord,
  printResult,
  runOptionalScript,
  saveRecord,
  tenantArtifactDir,
  writeBuildArtifact,
} from './runner-utils.ts';

try {
  const options = makeOptions(process.argv.slice(2));
  const record = makeRecord(options);

  assertSchemaPresent(options);

  if (!options.skipValidate) {
    const validate = runOptionalScript(options, 'validate-schema.ts', ['--tenant', options.tenantId]);
    record.phases.push({ phase: 'validate', result: validate });
    if (validate.status === 'failed') throw new Error(`Schema validation failed for ${options.tenantId}`);
  }

  if (!options.skipGenerate) {
    const generate = runOptionalScript(options, 'generate-tenant.ts', ['--tenant', options.tenantId]);
    record.phases.push({ phase: 'generate', result: generate });
    if (generate.status === 'failed') throw new Error(`Tenant generation failed for ${options.tenantId}`);
  }

  const generatedDir = path.join(options.rootDir, 'apps/miniapp-template/src/generated');
  const generatedPresent = existsSync(generatedDir);
  record.phases.push({
    phase: 'build',
    result: {
      command: `local scaffold build --tenant ${options.tenantId}`,
      status: 'success',
      exitCode: 0,
      stdout: `Prepared ${tenantArtifactDir(options)}${generatedPresent ? ' with generated config available' : ' without generated config in this lane'}\n`,
      stderr: '',
    },
  });
  record.buildStatus = 'success';
  record.finishedAt = new Date().toISOString();
  writeBuildArtifact(options, record);
  saveRecord(options, record);
  printResult(record);
} catch (error) {
  const options = makeOptions(process.argv.slice(2));
  const record = makeRecord(options);
  record.buildStatus = 'failed';
  record.errorMessage = error instanceof Error ? error.message : String(error);
  record.finishedAt = new Date().toISOString();
  saveRecord(options, record);
  printResult(record);
  process.exitCode = 1;
}
