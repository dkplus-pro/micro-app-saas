import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateTenant } from "../packages/generator/src/generateTenant.ts";
import { readArg, repoRootFromCwd } from "./args.ts";

const tenant = readArg("tenant");
const repoRoot = repoRootFromCwd();
const result = await generateTenant({ repoRoot, tenantId: tenant });
const templateRoot = path.join(repoRoot, "apps", "miniapp-template");
const tenantDist = result.distDir;

await mkdir(path.join(tenantDist, "template-src"), { recursive: true });
await cp(path.join(templateRoot, "src", "pages"), path.join(tenantDist, "template-src", "pages"), { recursive: true });
await cp(path.join(templateRoot, "src", "modules"), path.join(tenantDist, "template-src", "modules"), { recursive: true });
await writeFile(path.join(tenantDist, "build-summary.txt"), [
  `tenant=${tenant}`,
  `pages=${result.build.pages.map((page) => page.path).join(",")}`,
  `tabs=${result.build.tabBar.list.map((tab) => tab.text).join(",")}`,
  `modules=${result.build.modules.map((moduleEntry) => moduleEntry.key).join(",")}`,
  "upload=skipped-dry-run",
  "release=skipped-dry-run"
].join("\n") + "\n");

console.log(JSON.stringify({
  ok: true,
  tenant,
  appid: result.build.app.appid,
  pages: result.build.pages.map((page) => page.path),
  tabs: result.build.tabBar.list.map((tab) => tab.text),
  modules: result.build.modules.map((moduleEntry) => moduleEntry.key),
  distDir: tenantDist
}, null, 2));
