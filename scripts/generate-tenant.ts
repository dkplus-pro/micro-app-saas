import { generateTenant } from '../packages/generator/src/generator.js';
import { requireArg } from './args.js';

const tenant = requireArg('tenant');
const result = await generateTenant({ tenant });
console.log(JSON.stringify({ tenantId: result.tenantId, pageRoutes: result.pageRoutes, usedModules: result.usedModules }, null, 2));
