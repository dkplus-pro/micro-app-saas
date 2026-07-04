import type { TenantSchema } from './types.ts';

export function defineTenantSchema<TSchema extends TenantSchema>(schema: TSchema): TSchema {
  return schema;
}
