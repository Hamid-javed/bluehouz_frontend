//File: bluehouz_frontend\src\components\entities\role\RoleForm.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import {
  roleFieldConfig,
  roleFieldGroupOrder,
} from '@shared/config/roleFieldConfig'
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
const filteredRoleFieldConfig = roleFieldConfig.filter(
  (col) => !selectedFieldNames.includes((col as any).name)
)

interface RoleFormProps {
  roleId?: string
  submitLabel?: string
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

const RoleForm: React.FC<RoleFormProps> = ({ roleId, submitLabel }) => {
  const t = useTranslations()
  const isCreateMode = !roleId || roleId === 'new'

  type RoleFormInput = Record<string, any>

  const defaultValues = useMemo(() => {
    const defaults = getDefaultValuesFromConfig(roleFieldConfig)

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
  } = useForm<RoleFormInput>({
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (isCreateMode && defaultValues.id) {
      setValue('id', defaultValues.id)
    }
  }, [isCreateMode, defaultValues, setValue])

  const { data: roleData, loading } = useEntityGetOne<RoleFormInput>(
    'role',
    isCreateMode ? undefined : roleId,
    { fieldConfig: roleFieldConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<
    RoleFormInput,
    RoleFormInput
  >({
    entityType: 'role',
    entityId: isCreateMode ? undefined : roleId,
    existingData: isCreateMode ? undefined : roleData,
    resetForm: reset,
  })

  useEffect(() => {
    if (!isCreateMode && roleData) {
      reset({
        ...defaultValues,
        ...roleData,
      })
    }
  }, [roleData, reset, defaultValues, isCreateMode])

  const enumTypeKeys = extractEnumKeys(roleFieldConfig)
  const { enumOptionsMap, loading: enumLoading } = useEnumOptionsMap(enumTypeKeys)

  const visibleGroups = useMemo(() => {
    return roleFieldGroupOrder
  }, [])

  if (loading || enumLoading) return <p className="p-6">{t('common.loading')}</p>

  return (
    <ComponentCard title={t('role.title')}>
      <form onSubmit={handleSubmit((formData) => onSubmit(formData))}>
        <DynamicFormRenderer<RoleFormInput>
          fieldConfig={
            isCreateMode
              ? filteredRoleFieldConfig as unknown as any[]
              : roleFieldConfig as unknown as any[]
          }
          groupOrder={visibleGroups}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{} as Record<keyof RoleFormInput, any>}
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

export default RoleForm
