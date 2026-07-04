import { requireArg } from './args.ts';
const tenant = requireArg('tenant');
console.log(`DRY-RUN upload tenant ${tenant}: no external mini-program upload performed`);
