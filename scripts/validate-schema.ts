import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validateTenantSchema } from "../packages/schema/src/index.ts";
import { readArg, repoRootFromCwd } from "./args.ts";

const repoRoot = repoRootFromCwd();
const tenant = process.argv.some((arg) => arg.startsWith("--tenant=")) ? readArg("tenant") : undefined;
const schemaDir = path.join(repoRoot, "schemas", "tenants");
const schemaFiles = tenant ? [`${tenant}.schema.json`] : (await readdir(schemaDir)).filter((file) => file.endsWith(".schema.json"));

for (const schemaFile of schemaFiles) {
  const schemaPath = path.join(schemaDir, schemaFile);
  validateTenantSchema(JSON.parse(await readFile(schemaPath, "utf8")));
  console.log(`PASS schema ${schemaFile}`);
}
