import { writeFile } from "node:fs/promises";
import path from "node:path";
import { generateTenant } from "../packages/generator/src/generateTenant.ts";
import { readCsvArg, repoRootFromCwd } from "./args.ts";

const repoRoot = repoRootFromCwd();
const tenants = readCsvArg("tenants", "app1,app2");
const succeeded: string[] = [];
const failed: { tenant: string; error: string }[] = [];

for (const tenant of tenants) {
  try {
    const result = await generateTenant({ repoRoot, tenantId: tenant });
    succeeded.push(tenant);
    console.log(`PASS build tenant ${tenant} -> ${result.distDir}`);
  } catch (error) {
    failed.push({ tenant, error: error instanceof Error ? error.message : String(error) });
    console.error(`FAIL build tenant ${tenant}: ${failed.at(-1)?.error}`);
  }
}

const report = { succeeded, failed, finishedAt: new Date().toISOString() };
await writeFile(path.join(repoRoot, "apps", "miniapp-template", "dist", "batch-report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failed.length > 0) {
  process.exitCode = 1;
}
