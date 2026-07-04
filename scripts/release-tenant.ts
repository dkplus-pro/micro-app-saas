import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readArg, repoRootFromCwd } from "./args.ts";

const tenant = readArg("tenant");
const reportPath = path.join(repoRootFromCwd(), "apps", "miniapp-template", "dist", "tenants", tenant, "build-report.json");
const report = JSON.parse(await readFile(reportPath, "utf8"));
const next = { ...report, auditStatus: "dry_run_success", releaseStatus: "dry_run_success", releasedAt: new Date().toISOString() };
await writeFile(reportPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`DRY-RUN release tenant ${tenant}; no external release performed`);
