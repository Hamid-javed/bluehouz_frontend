// File: bluehouz_frontend\src\lib\getValidationRulesFromFieldConfig.ts

import { FieldConfig } from '@shared/types/fieldConfig'

type TranslateFunction = (key: string, params?: { default?: string; field?: string }) => string

export function getValidationRulesFromFieldConfig<T>(
  field: FieldConfig<T>,
  t: TranslateFunction
): Record<string, any> {
  const rules: Record<string, any> = {}

  // Use translated label if available; fallback to the field name
  const fallbackLabel = typeof field.label === 'string'
    ? t(field.label, { default: field.label })
    : String(field.name)

  // Required validation
  if (field.required) {
    rules.required = {
      value: true,
      message: t('errors.required', { default: `${fallbackLabel} is required`, field: fallbackLabel })
    }
  }

  // Min length validation
  if (typeof field.minLength === 'number') {
    rules.minLength = {
      value: field.minLength,
      message: t('errors.tooShort', { default: `${fallbackLabel} is too short`, field: fallbackLabel })
    }
  }

  // Max length validation
  if (typeof field.maxLength === 'number') {
    rules.maxLength = {
      value: field.maxLength,
      message: t('errors.tooLong', { default: `${fallbackLabel} is too long`, field: fallbackLabel })
    }
  }

  // Pattern validation
  if (field.pattern instanceof RegExp) {
    rules.pattern = {
      value: field.pattern,
      message: t('errors.invalid', { default: `${fallbackLabel} format is invalid`, field: fallbackLabel })
    }
  } else if (field.valueType === 'email') {
    // Email format validation
    rules.pattern = {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: t('errors.invalidEmail', { default: `${fallbackLabel} must be a valid email address`, field: fallbackLabel })
    }
  }

  console.debug(`[getValidationRulesFromFieldConfig] Rules for "${String(field.name)}":`, rules)

  return rules
}
