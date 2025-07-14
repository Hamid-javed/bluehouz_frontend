import { useTranslations } from 'next-intl';

export type FieldConfig<T extends Record<string | number, any>> = {
    name: keyof T;
    label: string;
};


export function useFieldHeader<T extends Record<string | number, any>>(config: FieldConfig<T>[]) {
  const t = useTranslations();

  function getFieldHeader(fieldName: keyof T): string {
    const field = config.find((f) => f.name === fieldName);
    return field ? t(field.label) : String(fieldName);
  }

  return { getFieldHeader };
}