import { requireArg } from './args.ts';
const tenant = requireArg('tenant');
console.log(`DRY-RUN release tenant ${tenant}: no external audit or release performed`);
