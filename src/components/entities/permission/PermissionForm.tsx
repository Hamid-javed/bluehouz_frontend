// File: bluehouz_frontend/src/components/entities/permission/PermissionForm.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import {
  permissionFieldConfig,
  permissionFieldGroupOrder,
} from '@shared/config/permissionFieldConfig'
import { extractEnumKeys } from '@/lib/schemaUtils'
import { useEnumOptionsMap } from '@/hooks/useEnumOptions'
import { useEntityGetOne } from '@/hooks/useEntityGetOne'
import { useEntityFormSubmit } from '@/hooks/useEntityFormSubmit'
import ComponentCard from '@/components/common/ComponentCard'
import Button from '@/components/ui/button/Button'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'
import { useTranslations } from 'next-intl'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'

const selectedFieldNames = ['organizationId', 'createdAt']

interface PermissionFormProps {
  permissionId?: string
  submitLabel?: string
}

interface TypedFieldConfig<T extends FieldValues = any>
  extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
}

const getDefaultValuesFromConfig = (
  config: SharedFieldConfig[]
): Record<string, any> => {
  const values: Record<string, any> = {}
  for (const field of config) {
    if (field.defaultValue !== undefined) {
      values[field.name as string] = field.defaultValue
    }
  }
  return values
}

const PermissionForm: React.FC<PermissionFormProps> = ({ permissionId, submitLabel }) => {
  const t = useTranslations()
  const isCreateMode = !permissionId || permissionId === 'new'

  type PermissionFormInput = Record<string, any>

  const defaultValues = useMemo(() => {
    const defaults = getDefaultValuesFromConfig(permissionFieldConfig)

    if (isCreateMode) {
      if (!defaults.id) {
        defaults.id = crypto.randomUUID()
      }
    }

    return defaults
  }, [isCreateMode])

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PermissionFormInput>({
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (isCreateMode && defaultValues.id) {
      setValue('id', defaultValues.id)
    }
  }, [isCreateMode, defaultValues, setValue])

  const { data: permissionData, loading } = useEntityGetOne<PermissionFormInput>(
    'permission',
    isCreateMode ? undefined : permissionId,
    { fieldConfig: permissionFieldConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<
    PermissionFormInput,
    PermissionFormInput
  >({
    entityType: 'permission',
    entityId: isCreateMode ? undefined : permissionId,
    existingData: isCreateMode ? undefined : permissionData,
    resetForm: reset,
  })

  useEffect(() => {
    if (!isCreateMode && permissionData) {
      reset({
        ...defaultValues,
        ...permissionData,
      })
    }
  }, [permissionData, reset, defaultValues, isCreateMode])

  const enumTypeKeys = extractEnumKeys(permissionFieldConfig)
  const { enumOptionsMap, loading: enumLoading } = useEnumOptionsMap(enumTypeKeys)

  const visibleGroups = useMemo(() => {
    return permissionFieldGroupOrder
  }, [])

  if (loading || enumLoading) return <p className="p-6">{t('common.loading')}</p>

  const typedPermissionFieldConfig = permissionFieldConfig as TypedFieldConfig<Record<string, any>>[]
  const typedFilteredPermissionFieldConfig = typedPermissionFieldConfig.filter(
    (col) => !selectedFieldNames.includes(col.name as string)
  )

  return (
    <ComponentCard title={t('permission.title')}>
      <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
        <DynamicFormRenderer<PermissionFormInput>
          fieldConfig={
            isCreateMode
              ? typedFilteredPermissionFieldConfig
              : typedPermissionFieldConfig
          }
          groupOrder={visibleGroups}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{} as Record<keyof PermissionFormInput, any>}
          groupHeaderClassName="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4"
        />
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={creating || updating}
          >
            {creating || updating
              ? t('common.saving')
              : submitLabel ?? t('common.submit')}
          </Button>
        </div>
      </form>
    </ComponentCard>
  )
}

export default PermissionForm
