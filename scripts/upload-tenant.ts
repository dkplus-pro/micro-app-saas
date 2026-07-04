import { makeOptions, loadRecord, printResult, saveRecord } from './runner-utils.ts';

try {
  const options = makeOptions(process.argv.slice(2));
  const record = loadRecord(options);
  if (record.buildStatus !== 'success') {
    throw new Error(`Cannot upload ${options.tenantId}: buildStatus=${record.buildStatus}`);
  }
  record.uploadStatus = 'success';
  record.previewQrCode = `simulated://preview/${options.tenantId}/${encodeURIComponent(record.version)}`;
  record.phases.push({
    phase: 'upload',
    result: {
      command: `simulated upload --tenant ${options.tenantId}`,
      status: 'success',
      exitCode: 0,
      stdout: 'External mini-program upload intentionally simulated; no network publish performed.\n',
      stderr: '',
    },
  });
  record.finishedAt = new Date().toISOString();
  saveRecord(options, record);
  printResult(record);
} catch (error) {
  const options = makeOptions(process.argv.slice(2));
  const record = loadRecord(options);
  record.uploadStatus = 'failed';
  record.errorMessage = error instanceof Error ? error.message : String(error);
  record.finishedAt = new Date().toISOString();
  saveRecord(options, record);
  printResult(record);
  process.exitCode = 1;
}
