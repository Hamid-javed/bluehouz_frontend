// File: src/lib/schemaUtils.ts

import { FieldConfig } from '@shared/types/fieldConfig'

// =============================
// Extract enum keys used by fields
// =============================
export function extractEnumKeys(fieldConfig: FieldConfig<any>[]): string[] {
  return fieldConfig
    .map((f) => f.enumTypeKey)
    .filter((key): key is string => typeof key === 'string')
}
