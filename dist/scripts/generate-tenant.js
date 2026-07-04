import { generateTenant } from '../packages/generator/src/generator.ts';
import { requireArg } from './args.ts';
const tenant = requireArg('tenant');
const result = await generateTenant({ tenant });
console.log(JSON.stringify({ tenantId: result.tenantId, pageRoutes: result.pageRoutes, usedModules: result.usedModules }, null, 2));
