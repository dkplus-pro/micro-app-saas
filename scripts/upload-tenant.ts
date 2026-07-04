import {
  loadRecord,
  makeOptions,
  saveRecord,
  printResult
} from './runner-utils.ts';

const options = makeOptions(process.argv.slice(2));
const record = loadRecord(options);
if (record.buildStatus !== 'success') {
  throw new Error(`Cannot upload ${options.tenantId}: buildStatus=${record.buildStatus}`);
}
record.uploadStatus = 'success';
record.previewQrCode = `simulated://preview/${options.tenantId}/${Date.now()}`;
record.finishedAt = new Date().toISOString();
saveRecord(options, record);
printResult(record);
