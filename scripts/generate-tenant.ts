import { generateTenant } from '../packages/generator/src/generateTenant.js';
import { readArg } from './args.js';

const tenant = readArg('tenant', 'app1');
const generated = await generateTenant({ tenant });
console.log(`PASS generate:tenant tenant=${tenant} pages=${generated.pages.map((page) => page.key).join(',')} modules=${generated.modules.join(',')}`);
