// File: utils/generateColumnsFromFieldConfig.ts

import { ColumnDef } from '@tanstack/react-table'
import { FieldConfig } from '@shared/types/fieldConfig'
import React from 'react'
import Checkbox from '@/components/form/input/Checkbox'

export function generateColumnsFromFieldConfig(
  config: FieldConfig[]
): ColumnDef<any>[] {
  return config
    .filter((field) => field.hidden !== true)
    .map((field) => {
      return {
        id: field.name as string,
        accessorKey: field.name as string,
        header: field.label || String(field.name),
        meta: {
          valueType: field.valueType
        },
        cell: (info: any) => {
          const value = info.getValue()
          if (field.valueType === 'boolean') {
            return React.createElement(Checkbox, { checked: value, disabled: true });
          } else if (field.valueType === 'date' && value) {
            return new Date(value).toLocaleDateString()
          }
          return value ?? ''
        }
      } as ColumnDef<any>
    })
}
