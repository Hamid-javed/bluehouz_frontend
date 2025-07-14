// //File: bluehouz_frontend\src\components\form\render\DynamicFormRenderer.tsx

// 'use client'

// import React, { useEffect, useState } from 'react'
// import {
//   FieldValues,
//   FieldErrors,
//   UseFormWatch,
//   Path,
//   Control,
//   Controller,
//   UseFormSetValue,
// } from 'react-hook-form'
// import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'
// import Input from '@/components/form/input/InputField'
// import TextArea from '@/components/form/input/TextArea'
// import Select from '@/components/form/input/Select'
// import Checkbox from '@/components/form/input/Checkbox'
// import AsyncSelect from '../input/AsynchSelect'
// import { ChevronDownIcon } from '@/icons'
// import { useTranslations, useLocale } from 'next-intl'
// import { formatToHtmlDate, formatToLocalDatetime } from '@/lib/formatter'
// import { normalizeValueByType } from '@shared/utils/normalizer'
// import { getValidationRulesFromFieldConfig } from '@/lib/getValidationRulesFromFieldConfig'

// interface TypedFieldConfig<T extends FieldValues> extends SharedFieldConfig<T> {
//   conditional?: (watch: UseFormWatch<T>) => boolean
// }

// interface Props<T extends FieldValues> {
//   fieldConfig: TypedFieldConfig<T>[]
//   groupOrder: string[]
//   watch: UseFormWatch<T>
//   setValue: UseFormSetValue<T>
//   control: Control<T>
//   errors: FieldErrors<T>
//   enumOptionsMap: Record<string, { value: string; label: string }[]>
//   fieldMeta?: Record<keyof T, any>
//   groupHeaderClassName?: string
// }

// function useVisibleValue(value: any, valueType: string | undefined) {
//   const [visibleValue, setVisibleValue] = useState(() => {
//     if (valueType === 'date') return formatToHtmlDate(value)
//     if (valueType === 'datetime') return formatToLocalDatetime(value)
//     return value ?? ''
//   })

//   useEffect(() => {
//     const formatted =
//       valueType === 'date'
//         ? formatToHtmlDate(value)
//         : valueType === 'datetime'
//           ? formatToLocalDatetime(value)
//           : value ?? ''
//     setVisibleValue(formatted)
//   }, [value, valueType])

//   return [visibleValue, setVisibleValue] as const
// }

// function extractErrorMessage(fieldState: any) {
//   return typeof fieldState.error?.message === 'string' ? fieldState.error.message : undefined
// }

// const DynamicFormRenderer = <T extends FieldValues>({
//   fieldConfig,
//   groupOrder,
//   watch,
//   control,
//   errors,
//   enumOptionsMap,
//   fieldMeta = {} as Record<keyof T, any>,
//   groupHeaderClassName,
// }: Props<T>) => {
//   const t = useTranslations()
//   const locale = useLocale()

//   const groupedFields = fieldConfig.reduce((acc, field) => {
//     const group = field.group || 'default'
//     acc[group] = acc[group] || []
//     acc[group].push(field)
//     return acc
//   }, {} as Record<string, TypedFieldConfig<T>[]>)

//   const renderField = (field: TypedFieldConfig<T>) => {
//     const path = field.name as Path<T>
//     if (field.conditional && !field.conditional(watch)) return null

//     const fieldError = errors[field.name as keyof T]
//     const dynamicOptions =
//   field.enumOptions ??
//   field.options ??
//   (field.enumTypeKey ? enumOptionsMap[field.enumTypeKey] : [])

//     const baseId = `field-${String(path)}`
//     const describedById = fieldError ? `${baseId}-error` : undefined
//     const label = field.label ? t(field.label, { default: field.label }) : undefined
//     const hint = field.supportingText ? t(field.supportingText, { default: '' }) : undefined
//     const placeholder = field.placeholder ? t(field.placeholder, { default: '' }) : undefined
//     const defaultErrorMessage =
//       field.valueType === 'email'
//         ? undefined
//         : field.errorMessage
//           ? t(field.errorMessage, { default: '' })
//           : undefined

//     const sharedInputProps = {
//       id: baseId,
//       label: !field.hideLabel ? label : undefined,
//       readOnly: field.readOnly === true,
//       maxLength: field.maxLength,
//       minLength: field.minLength,
//       required: field.required,
//       placeholder,
//       hint,
//       'aria-invalid': !!fieldError || undefined,
//       'aria-describedby': describedById,
//     }

//     switch (field.uiElement) {
//       case 'text':
//       case 'email':
//       case 'date':
//       case 'time':
//       case 'datetime':
//       case 'number':
//       case 'currency':
//       case 'phone':
//         return (
//           <div key={String(field.name)}>
//             <Controller
//               name={path}
//               control={control}
//               rules={getValidationRulesFromFieldConfig(field, t)}
//               render={({ field: controllerField, fieldState }) => {
//                 const [visibleValue, setVisibleValue] = useVisibleValue(
//                   controllerField.value,
//                   field.valueType ?? 'text'
//                 )

//                 const inputType =
//                   field.valueType === 'date'
//                     ? 'date'
//                     : field.valueType === 'datetime'
//                       ? 'datetime-local'
//                       : 'text'

//                 return !field.hidden && (
//                   <Input
//                     {...sharedInputProps}
//                     value={visibleValue}
//                     type={inputType}
//                     errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
//                     onChange={(e) => {
//                       const val = e.target.value
//                       setVisibleValue(val)
//                       controllerField.onChange(val === '' ? undefined : val)
//                     }}
//                     onBlur={(e) => {
//                       const raw = e.target.value
//                       const parsed = normalizeValueByType(raw, field.valueType as any)
//                       console.debug('Normalized input:', parsed)
//                       controllerField.onChange(parsed)
//                       controllerField.onBlur()
//                     }}
//                     onHistoryClick={
//                       field.enableHistory
//                         ? () => console.log(`Show history for field: ${String(path)}`)
//                         : undefined
//                     }
//                   />
//                 )
//               }}
//             />
//           </div>
//         )

//       case 'select':
//       case 'multiSelect':
//       case 'radio':
//         return (
//           <div key={String(field.name)} className="relative">
//             <Controller
//               name={path}
//               control={control}
//               rules={getValidationRulesFromFieldConfig(field, t)}
//               render={({ field: controllerField, fieldState }) => {
//                 return !field.hidden && <>
//                   <Select
//                     name={String(field.name)}
//                     {...sharedInputProps}
//                     options={dynamicOptions}
//                     value={controllerField.value ?? ''}
//                     onChange={controllerField.onChange}
//                     disabled={field.readOnly === true}
//                     error={!!fieldState.error}
//                     errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
//                   />
//                   <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
//                     <ChevronDownIcon />
//                   </span>
//                 </>
//               }}
//             />
//           </div>
//         )

//       case 'checkbox':
//       case 'switch':
//         return (
//           <div key={String(field.name)}>
//             <Controller
//               name={path}
//               control={control}
//               rules={getValidationRulesFromFieldConfig(field, t)}
//               render={({ field: controllerField, fieldState }) => {
//                 return !field.hidden && <Checkbox
//                   {...sharedInputProps}
//                   label={label || ''}
//                   checked={!!controllerField.value}
//                   onChange={controllerField.onChange}
//                   errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
//                 />
//               }}
//             />
//           </div>
//         )

//         case 'asyncSelect':
//   return (
//     <div key={String(field.name)}>
//       <Controller
//         name={path}
//         control={control}
//         rules={getValidationRulesFromFieldConfig(field, t)}
//         render={({ field: controllerField, fieldState }) => {
//         if (field.hidden) return <></>
//         return (
//           <AsyncSelect
//             name={String(field.name)}
//             value={controllerField.value}
//             onChange={controllerField.onChange}
//             label={label}
//             placeholder={placeholder}
//             dataSource={field.dataSource}
//             errorMessage={extractErrorMessage(fieldState)}
//             disabled={field.readOnly}
//             required={field.required}
//           />
//         )
//       }}
//       />
//     </div>
//   )


//       case 'textArea':
//         return (
//           <div key={String(field.name)}>
//             <Controller
//               name={path}
//               control={control}
//               rules={getValidationRulesFromFieldConfig(field, t)}
//               render={({ field: controllerField, fieldState }) => {
//                 return !field.hidden && <TextArea
//                   {...sharedInputProps}
//                   value={controllerField.value ?? ''}
//                   onChange={controllerField.onChange}
//                   onBlur={controllerField.onBlur}
//                   errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
//                 />
//               }}
//             />
//           </div>
//         )

//       default:
//         return null
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
//       {groupOrder.map((groupName) => {
//         const fields = groupedFields[groupName]
//         if (!fields) return null
//         return (
//           <div key={groupName} className="space-y-6">
//             {groupName !== 'default' && (
//               <h3 className={groupHeaderClassName ?? 'text-lg font-semibold text-gray-800 dark:text-white/90'}>
//                 {t(`contact.groups.${groupName}`, { default: groupName })}
//               </h3>
//             )}
//             {fields.map((field) => renderField(field))}
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// export default DynamicFormRenderer


'use client'

import React from 'react'
import {
  FieldValues,
  FieldErrors,
  UseFormWatch,
  Path,
  Control,
  Controller,
  UseFormSetValue,
} from 'react-hook-form'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'
import Input from '@/components/form/input/InputField'
import TextArea from '@/components/form/input/TextArea'
import Select from '@/components/form/input/Select'
import Checkbox from '@/components/form/input/Checkbox'
import AsyncSelect from '../input/AsynchSelect'
import { ChevronDownIcon } from '@/icons'
import { useTranslations, useLocale } from 'next-intl'
import { getValidationRulesFromFieldConfig } from '@/lib/getValidationRulesFromFieldConfig'

interface TypedFieldConfig<T extends FieldValues> extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
}

interface Props<T extends FieldValues> {
  fieldConfig: TypedFieldConfig<T>[]
  groupOrder: string[]
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
  control: Control<T>
  errors: FieldErrors<T>
  enumOptionsMap: Record<string, { value: string; label: string }[]>
  fieldMeta?: Record<keyof T, any>
  groupHeaderClassName?: string
}

function extractErrorMessage(fieldState: any) {
  return typeof fieldState.error?.message === 'string' ? fieldState.error.message : undefined
}

const DynamicFormRenderer = <T extends FieldValues>({
  fieldConfig,
  groupOrder,
  watch,
  control,
  errors,
  enumOptionsMap,
  fieldMeta = {} as Record<keyof T, any>,
  groupHeaderClassName,
}: Props<T>) => {
  const t = useTranslations()
  const locale = useLocale()

  const groupedFields = fieldConfig.reduce((acc, field) => {
    const group = field.group || 'default'
    acc[group] = acc[group] || []
    acc[group].push(field)
    return acc
  }, {} as Record<string, TypedFieldConfig<T>[]>)
  
  const renderField = (field: TypedFieldConfig<T>) => {
    const path = field.name as Path<T>
    if (field.conditional && !field.conditional(watch)) return null

    const fieldError = errors[field.name as keyof T]
    const dynamicOptions =
      field.enumOptions ?? field.options ?? (field.enumTypeKey ? enumOptionsMap[field.enumTypeKey] : [])

    const baseId = `field-${String(path)}`
    const describedById = fieldError ? `${baseId}-error` : undefined
    const label = field.label ? t(field.label, { default: field.label }) : undefined
    const hint = field.supportingText ? t(field.supportingText, { default: '' }) : undefined
    const placeholder = field.placeholder ? t(field.placeholder, { default: '' }) : undefined
    const defaultErrorMessage =
      field.valueType === 'email'
        ? undefined
        : field.errorMessage
        ? t(field.errorMessage, { default: '' })
        : undefined

    const sharedInputProps = {
      id: baseId,
      label: !field.hideLabel ? label : undefined,
      readOnly: field.readOnly === true,
      maxLength: field.maxLength,
      minLength: field.minLength,
      required: field.required,
      placeholder,
      hint,
      'aria-invalid': !!fieldError || undefined,
      'aria-describedby': describedById,
    }

    switch (field.uiElement) {
      case 'text':
      case 'email':
      case 'date':
      case 'time':
      case 'datetime':
      case 'number':
      case 'currency':
      case 'phone':
        return (
          <div key={String(field.name)}>
            <Controller
              name={path}
              control={control}
              rules={getValidationRulesFromFieldConfig(field, t)}
              render={({ field: controllerField, fieldState }) => {
                const inputType =
                  field.valueType === 'date'
                    ? 'date'
                    : field.valueType === 'datetime'
                    ? 'datetime-local'
                    : field.valueType === 'email'
                    ? 'email'
                    : field.valueType === 'number'
                    ? 'number'
                    : 'text'

                return !field.hidden && (
                  <Input
                    {...sharedInputProps}
                    type={inputType}
                    value={controllerField.value ?? ''}
                    onChange={(e) => controllerField.onChange(e.target.value)}
                    onBlur={controllerField.onBlur}
                    errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
                  />
                )
              }}
            />
          </div>
        )

      case 'select':
      case 'multiSelect':
      case 'radio':
        return (
          <div key={String(field.name)} className="relative">
            <Controller
              name={path}
              control={control}
              rules={getValidationRulesFromFieldConfig(field, t)}
              render={({ field: controllerField, fieldState }) => {
                return !field.hidden && (
                  <>
                    <Select
                      name={String(field.name)}
                      {...sharedInputProps}
                      options={dynamicOptions}
                      value={controllerField.value ?? ''}
                      onChange={controllerField.onChange}
                      disabled={field.readOnly === true}
                      error={!!fieldState.error}
                      errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </>
                )
              }}
            />
          </div>
        )

      case 'checkbox':
      case 'switch':
        return (
          <div key={String(field.name)}>
            <Controller
              name={path}
              control={control}
              rules={getValidationRulesFromFieldConfig(field, t)}
              render={({ field: controllerField, fieldState }) => {
                return !field.hidden && (
                  <Checkbox
                    {...sharedInputProps}
                    label={label || ''}
                    checked={!!controllerField.value}
                    onChange={controllerField.onChange}
                    errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
                  />
                )
              }}
            />
          </div>
        )

      case 'asyncSelect':
        return (
          <div key={String(field.name)}>
            <Controller
              name={path}
              control={control}
              rules={getValidationRulesFromFieldConfig(field, t)}
              render={({ field: controllerField, fieldState }) => {
                if (field.hidden) return null
                return (
                  <AsyncSelect
                    name={String(field.name)}
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    label={label}
                    placeholder={placeholder}
                    dataSource={field.dataSource}
                    errorMessage={extractErrorMessage(fieldState)}
                    disabled={field.readOnly}
                    required={field.required}
                  />
                )
              }}
            />
          </div>
        )

      case 'textArea':
        return (
          <div key={String(field.name)}>
            <Controller
              name={path}
              control={control}
              rules={getValidationRulesFromFieldConfig(field, t)}
              render={({ field: controllerField, fieldState }) => {
                return !field.hidden && (
                  <TextArea
                    {...sharedInputProps}
                    value={controllerField.value ?? ''}
                    onChange={controllerField.onChange}
                    onBlur={controllerField.onBlur}
                    errorMessage={extractErrorMessage(fieldState) || defaultErrorMessage}
                  />
                )
              }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {groupOrder.map((groupName) => {
        const fields = groupedFields[groupName]
        if (!fields) return null
        return (
          <div key={groupName} className="space-y-6">
            {groupName !== 'default' && (
              <h3 className={groupHeaderClassName ?? 'text-lg font-semibold text-gray-800 dark:text-white/90'}>
                {t(`contact.groups.${groupName}`, { default: groupName })}
              </h3>
            )}
            {fields.map((field) => renderField(field))}
          </div>
        )
      })}
    </div>
  )
}

export default DynamicFormRenderer
