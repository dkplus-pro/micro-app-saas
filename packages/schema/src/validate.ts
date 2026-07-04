import { validateTenantSchema as validateTenantSchemaResult } from './validation.ts';
import type { TenantSchema } from './types.ts';

export class SchemaValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Tenant schema validation failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'SchemaValidationError';
  }
}

export function validateTenantSchema(input: unknown): TenantSchema {
  const result = validateTenantSchemaResult(input);
  if (!result.valid) {
    throw new SchemaValidationError(result.errors.map(toStrictCompatibilityIssue));
  }
  return input as TenantSchema;
}

function toStrictCompatibilityIssue(issue: string): string {
  const unknownModule = issue.match(/^(.*\.modules) references unknown module (.+)$/);
  if (unknownModule) return `${unknownModule[1]} references unsupported module ${unknownModule[2]}`;

  const disabledTab = issue.match(/^tab (.+) points to disabled page (.+)$/);
  if (disabledTab) return `tabs[].page ${disabledTab[2]} must reference an enabled page`;

  const missingTab = issue.match(/^tab (.+) points to missing page (.+)$/);
  if (missingTab) return `tabs[].page ${missingTab[2]} must reference an enabled page`;

  return issue;
}
