import { readFileSync } from 'node:fs';
import path from 'node:path';
import { generateTenant } from '../packages/generator/src/generator.ts';
import { assertSchemaPresent, makeOptions, makeRecord, saveRecord, tenantArtifactDir, tenantSchemaPath, writeJson } from './runner-utils.ts';
const options = makeOptions(process.argv.slice(2));
assertSchemaPresent(options);
const record = makeRecord(options);
try {
    const artifactDir = tenantArtifactDir(options);
    const shouldGenerate = !options.skipGenerate && isFullTenantSchema(tenantSchemaPath(options));
    if (shouldGenerate) {
        const artifacts = await generateTenant({ tenant: options.tenantId, schemaDir: options.schemaDir, outputDir: artifactDir });
        writeJson(path.join(artifactDir, 'manifest.generated.json'), artifacts.appConfig);
        writeJson(path.join(artifactDir, 'pages.generated.json'), { pages: artifacts.pagesConfig, tabBar: artifacts.tabbarConfig });
        writeJson(path.join(artifactDir, 'build.generated.json'), {
            tenantId: artifacts.tenantId,
            pages: artifacts.pagesConfig,
            tabBar: artifacts.tabbarConfig,
            modules: artifacts.usedModules.map((key) => ({ key }))
        });
        await import('node:fs/promises').then(({ writeFile }) => writeFile(path.join(artifactDir, 'module-entry.ts'), `${artifacts.moduleEntrySource}\n`));
    }
    else {
        writeJson(path.join(artifactDir, 'build.generated.json'), {
            tenantId: options.tenantId,
            pages: [],
            tabBar: { list: [] },
            modules: []
        });
    }
    record.buildStatus = 'success';
    record.finishedAt = new Date().toISOString();
    saveRecord(options, record);
    console.log(`PASS build tenant ${options.tenantId}: dry-run artifact=${path.relative(options.rootDir, artifactDir)}`);
}
catch (error) {
    record.buildStatus = 'failed';
    record.errorMessage = error instanceof Error ? error.message : String(error);
    record.finishedAt = new Date().toISOString();
    saveRecord(options, record);
    throw error;
}
function isFullTenantSchema(file) {
    const schema = JSON.parse(readFileSync(file, 'utf8'));
    return Boolean(schema.tenant && schema.app && schema.tabs && schema.pages);
}
