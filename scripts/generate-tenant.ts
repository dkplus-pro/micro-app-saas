import { generateTenant } from "../packages/generator/src/generateTenant.ts";
import { readArg, repoRootFromCwd } from "./args.ts";

const tenant = readArg("tenant");
const result = await generateTenant({ repoRoot: repoRootFromCwd(), tenantId: tenant });
console.log(JSON.stringify({ ok: true, tenant, generatedDir: result.generatedDir, distDir: result.distDir }, null, 2));
