// File: src/lib/formatter.ts

type FormatType = 'date' | 'time' | 'datetime' | 'number' | 'currency'

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  } catch {
    return String(value)
  }
}

export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(value)
  } catch {
    return String(value)
  }
}

export function formatToHtmlDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (!(date instanceof Date) || isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0] // 'YYYY-MM-DD'
}

export function formatToLocalDatetime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  if (!(date instanceof Date) || isNaN(date.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  return `${y}-${m}-${d}T${h}:${min}`
}


export function formatValueByType(
  value: string | number | Date | null | undefined,
  formatType: FormatType,
  locale: string,
  options?: { currency?: string }
): string {
  if (value == null) return ''

  switch (formatType) {
    case 'number':
      return typeof value === 'number' ? formatNumber(value, locale) : String(value)

    case 'currency':
      return typeof value === 'number'
        ? formatCurrency(value, locale, options?.currency ?? 'CHF')
        : String(value)

    case 'date':
      if (typeof value === 'string' || value instanceof Date) {
        return formatToHtmlDate(value)
      }
      return ''

    case 'datetime':
      if (typeof value === 'string' || value instanceof Date) {
        return formatToLocalDatetime(value)
      }
      return ''

    default:
      return String(value)
  }
}
