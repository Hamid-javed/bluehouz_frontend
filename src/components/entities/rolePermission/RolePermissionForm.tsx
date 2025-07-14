// File: bluehouz_frontend/src/components/entities/rolePermission/RolePermissionForm.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import {
  rolePermissionFieldConfig,
  rolePermissionFieldGroupOrder,
} from '@shared/config/rolePermissionFieldConfig'
import { extractEnumKeys } from '@/lib/schemaUtils'
import { useEnumOptionsMap } from '@/hooks/useEnumOptions'
import { useEntityGetOne } from '@/hooks/useEntityGetOne'
import { useEntityFormSubmit } from '@/hooks/useEntityFormSubmit'
import ComponentCard from '@/components/common/ComponentCard'
import Button from '@/components/ui/button/Button'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'

interface RolePermissionFormProps {
  rolePermissionId?: string
  submitLabel?: string
}

interface TypedFieldConfig<T extends FieldValues = any> extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
}

const selectedFieldNames = ['organizationId', 'createdAt']

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

const RolePermissionForm: React.FC<RolePermissionFormProps> = ({ rolePermissionId, submitLabel }) => {
  const t = useTranslations()
  const params = useSearchParams()
  const isCreateMode = !rolePermissionId || rolePermissionId === 'new'

  type RolePermissionFormInput = Record<string, any>

  const defaultValues = useMemo(() => {
    const defaults = getDefaultValuesFromConfig(rolePermissionFieldConfig)
    if (isCreateMode) {
      if (!defaults.id) defaults.id = crypto.randomUUID()
      const roleIdFromUrl = params.get('roleId')
      if (roleIdFromUrl) defaults.roleId = roleIdFromUrl
    }
    return defaults
  }, [isCreateMode, params])

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<RolePermissionFormInput>({
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (isCreateMode && defaultValues.id) {
      setValue('id', defaultValues.id)
    }
  }, [isCreateMode, defaultValues, setValue])

  const { data: rolePermissionData, loading } = useEntityGetOne<RolePermissionFormInput>(
    'rolePermission',
    isCreateMode ? undefined : rolePermissionId,
    { fieldConfig: rolePermissionFieldConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<RolePermissionFormInput, RolePermissionFormInput>({
    entityType: 'rolePermission',
    entityId: isCreateMode ? undefined : rolePermissionId,
    existingData: isCreateMode ? undefined : rolePermissionData,
    resetForm: reset,
  })

  useEffect(() => {
    if (!isCreateMode && rolePermissionData) {
      reset({
        ...defaultValues,
        ...rolePermissionData,
      })
    }
  }, [rolePermissionData, reset, defaultValues, isCreateMode])

  const enumTypeKeys = extractEnumKeys(rolePermissionFieldConfig)
  const { enumOptionsMap, loading: enumLoading } = useEnumOptionsMap(enumTypeKeys)

  const visibleGroups = useMemo(() => {
    return rolePermissionFieldGroupOrder ?? ['default']
  }, [])

  if (loading || enumLoading) return <p className="p-6">{t('common.loading')}</p>

  const typedFieldConfig = rolePermissionFieldConfig as TypedFieldConfig<RolePermissionFormInput>[]
  const filteredFieldConfig = typedFieldConfig.filter(
    (col) => !selectedFieldNames.includes(col.name as string)
  )

  return (
    <ComponentCard title={t('rolePermission.title')}>
      <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
        <DynamicFormRenderer<RolePermissionFormInput>
          fieldConfig={isCreateMode ? filteredFieldConfig : typedFieldConfig}
          groupOrder={visibleGroups}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{} as Record<keyof RolePermissionFormInput, any>}
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

export default RolePermissionForm
