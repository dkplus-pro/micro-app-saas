import { makeOptions, loadRecord, printResult, saveRecord } from './runner-utils.ts';

try {
  const options = makeOptions(process.argv.slice(2));
  const record = loadRecord(options);
  if (record.uploadStatus !== 'success') {
    throw new Error(`Cannot release ${options.tenantId}: uploadStatus=${record.uploadStatus}`);
  }
  record.auditStatus = 'success';
  record.releaseStatus = 'success';
  record.phases.push({
    phase: 'release',
    result: {
      command: `simulated release --tenant ${options.tenantId}`,
      status: 'success',
      exitCode: 0,
      stdout: 'External audit/release intentionally simulated; no production action performed.\n',
      stderr: '',
    },
  });
  record.finishedAt = new Date().toISOString();
  saveRecord(options, record);
  printResult(record);
} catch (error) {
  const options = makeOptions(process.argv.slice(2));
  const record = loadRecord(options);
  record.releaseStatus = 'failed';
  record.errorMessage = error instanceof Error ? error.message : String(error);
  record.finishedAt = new Date().toISOString();
  saveRecord(options, record);
  printResult(record);
  process.exitCode = 1;
}
