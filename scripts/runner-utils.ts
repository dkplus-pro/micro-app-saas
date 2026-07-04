import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type RunnerStatus = 'success' | 'failed' | 'skipped';
export type ReleasePhase = 'build' | 'upload' | 'release';

export interface RunnerOptions {
  tenantId: string;
  rootDir: string;
  schemaDir: string;
  outDir: string;
  recordsDir: string;
  version: string;
  dryRun: boolean;
  skipValidate: boolean;
  skipGenerate: boolean;
}

export interface CommandResult {
  command: string;
  status: RunnerStatus;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  skippedReason?: string;
}

export interface ReleaseRecord {
  tenantId: string;
  appKey: string;
  version: string;
  schemaVersion: string;
  commitSha: string;
  buildStatus: RunnerStatus;
  uploadStatus: RunnerStatus;
  auditStatus: RunnerStatus;
  releaseStatus: RunnerStatus;
  errorMessage: string | null;
  previewQrCode: string | null;
  buildArtifactDir: string;
  createdAt: string;
  finishedAt: string | null;
  runnerJobUrl: string | null;
  simulated: boolean;
  phases: Array<{ phase: ReleasePhase | 'validate' | 'generate'; result: CommandResult }>;
}

const CURRENT_FILE = fileURLToPath(import.meta.url);
export const DEFAULT_ROOT = path.resolve(path.dirname(CURRENT_FILE), '..');

export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      if (!args._) args._ = arg;
      continue;
    }
    const [rawKey, inlineValue] = arg.slice(2).split('=', 2);
    const key = toCamelCase(rawKey);
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function requireTenant(args: Record<string, string | boolean>): string {
  const tenant = String(args.tenant || args._ || '').trim();
  if (!tenant) {
    throw new Error('Missing tenant. Use --tenant <tenantId>.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(tenant)) {
    throw new Error(`Invalid tenant "${tenant}". Use letters, numbers, underscore, or dash only.`);
  }
  return tenant;
}

export function makeOptions(argv: string[]): RunnerOptions {
  const args = parseArgs(argv);
  const rootDir = path.resolve(String(args.rootDir || DEFAULT_ROOT));
  const tenantId = requireTenant(args);
  return {
    tenantId,
    rootDir,
    schemaDir: path.resolve(rootDir, String(args.schemaDir || 'schemas/tenants')),
    outDir: path.resolve(rootDir, String(args.outDir || 'apps/miniapp-template/dist/tenants')),
    recordsDir: path.resolve(rootDir, String(args.recordsDir || '.runner-records')),
    version: String(args.version || process.env.RELEASE_VERSION || '0.0.0-local'),
    dryRun: args.dryRun !== false,
    skipValidate: Boolean(args.skipValidate),
    skipGenerate: Boolean(args.skipGenerate),
  };
}

export function makeRecord(options: RunnerOptions): ReleaseRecord {
  const now = new Date().toISOString();
  const schema = readTenantSchemaIfPresent(options);
  return {
    tenantId: options.tenantId,
    appKey: readSchemaString(schema, ['app', 'appKey'], options.tenantId),
    version: options.version,
    schemaVersion: readSchemaString(schema, ['schemaVersion'], 'local'),
    commitSha: getCommitSha(options.rootDir),
    buildStatus: 'skipped',
    uploadStatus: 'skipped',
    auditStatus: 'skipped',
    releaseStatus: 'skipped',
    errorMessage: null,
    previewQrCode: null,
    buildArtifactDir: tenantArtifactDir(options),
    createdAt: now,
    finishedAt: null,
    runnerJobUrl: process.env.CI_JOB_URL || null,
    simulated: true,
    phases: [],
  };
}

export function tenantSchemaPath(options: RunnerOptions): string {
  return path.join(options.schemaDir, `${options.tenantId}.schema.json`);
}

export function tenantArtifactDir(options: RunnerOptions): string {
  return path.join(options.outDir, options.tenantId);
}

export function recordPath(options: RunnerOptions): string {
  return path.join(options.recordsDir, `${options.tenantId}.release-record.json`);
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function writeJson(file: string, value: unknown): void {
  ensureDir(path.dirname(file));
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

export function saveRecord(options: RunnerOptions, record: ReleaseRecord): void {
  writeJson(recordPath(options), record);
}

export function loadRecord(options: RunnerOptions): ReleaseRecord {
  if (!existsSync(recordPath(options))) {
    throw new Error(`Missing release record for ${options.tenantId}. Run runner:build first.`);
  }
  return readJson<ReleaseRecord>(recordPath(options));
}

export function runOptionalScript(options: RunnerOptions, scriptName: string, args: string[]): CommandResult {
  const scriptPath = path.join(options.rootDir, 'scripts', scriptName);
  if (!existsSync(scriptPath)) {
    return {
      command: `node scripts/${scriptName} ${args.join(' ')}`.trim(),
      status: 'skipped',
      exitCode: null,
      stdout: '',
      stderr: '',
      skippedReason: `scripts/${scriptName} not present in this lane/worktree`,
    };
  }
  const child = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: options.rootDir,
    encoding: 'utf8',
    env: { ...process.env, TENANT_ID: options.tenantId },
  });
  return {
    command: `node scripts/${scriptName} ${args.join(' ')}`.trim(),
    status: child.status === 0 ? 'success' : 'failed',
    exitCode: child.status,
    stdout: child.stdout || '',
    stderr: child.stderr || '',
  };
}

export function assertSchemaPresent(options: RunnerOptions): void {
  if (!existsSync(tenantSchemaPath(options))) {
    throw new Error(`Missing tenant schema: ${path.relative(options.rootDir, tenantSchemaPath(options))}`);
  }
}

export function writeBuildArtifact(options: RunnerOptions, record: ReleaseRecord): void {
  const artifactDir = tenantArtifactDir(options);
  ensureDir(artifactDir);
  writeJson(path.join(artifactDir, 'build-record.json'), {
    tenantId: record.tenantId,
    appKey: record.appKey,
    version: record.version,
    commitSha: record.commitSha,
    builtAt: record.finishedAt,
    generatedDir: path.relative(options.rootDir, path.join(options.rootDir, 'apps/miniapp-template/src/generated')),
    simulated: true,
  });
}

export function printResult(record: ReleaseRecord): void {
  console.log(JSON.stringify(record, null, 2));
}

function readTenantSchemaIfPresent(options: RunnerOptions): unknown {
  const file = tenantSchemaPath(options);
  if (!existsSync(file)) return null;
  return readJson<unknown>(file);
}

function readSchemaString(schema: unknown, keys: string[], fallback: string): string {
  let value: unknown = schema;
  for (const key of keys) {
    if (!value || typeof value !== 'object' || !(key in value)) return fallback;
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getCommitSha(rootDir: string): string {
  const child = spawnSync('git', ['rev-parse', '--short=12', 'HEAD'], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  return child.status === 0 ? child.stdout.trim() : 'unknown';
}

function toCamelCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
