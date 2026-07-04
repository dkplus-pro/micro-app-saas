import {
  loadRecord,
  makeOptions,
  saveRecord,
  printResult
} from './runner-utils.ts';

const options = makeOptions(process.argv.slice(2));
const record = loadRecord(options);
if (record.buildStatus !== 'success') {
  throw new Error(`Cannot release ${options.tenantId}: buildStatus=${record.buildStatus}`);
}
if (record.uploadStatus !== 'success') {
  throw new Error(`Cannot release ${options.tenantId}: uploadStatus=${record.uploadStatus}`);
}
record.auditStatus = 'success';
record.releaseStatus = 'success';
record.finishedAt = new Date().toISOString();
saveRecord(options, record);
printResult(record);
