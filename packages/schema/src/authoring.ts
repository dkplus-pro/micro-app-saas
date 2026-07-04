import type { TenantSchema } from './types.ts';

export function defineTenantSchema<const T extends TenantSchema>(schema: T): T {
  return schema;
}
