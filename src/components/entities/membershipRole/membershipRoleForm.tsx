'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import {
  membershipRoleFieldConfig,
  membershipRoleFieldGroupOrder
} from '@shared/config/membershipRoleFieldConfig'
import { useEnumOptionsMap } from '@/hooks/useEnumOptions'
import { useEntityGetOne } from '@/hooks/useEntityGetOne'
import { useEntityFormSubmit } from '@/hooks/useEntityFormSubmit'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'
import { useTranslations } from 'next-intl'

interface MembershipRoleFormProps {
  membershipRoleId?: string
  submitLabel?: string
}

interface TypedFieldConfig<T extends FieldValues = any>
  extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
  enumType?: string // ✅ Fix: allow enumType to be accessed safely
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

const MembershipRoleForm: React.FC<MembershipRoleFormProps> = ({
  membershipRoleId,
  submitLabel
}) => {
  const t = useTranslations()
  const isCreateMode = !membershipRoleId || membershipRoleId === 'new'

  type FormInput = Record<string, any>
  const typedConfig = membershipRoleFieldConfig as TypedFieldConfig<FormInput>[]

  const defaultValues = useMemo(() => {
    const defaults = getDefaultValuesFromConfig(typedConfig)
    if (isCreateMode) {
      if (!defaults.id) defaults.id = crypto.randomUUID()
      if (!defaults.organizationId) defaults.organizationId = crypto.randomUUID()
    }
    return defaults
  }, [isCreateMode])

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormInput>({
    defaultValues,
    mode: 'onBlur'
  })

  useEffect(() => {
    if (isCreateMode) {
      setValue('id', defaultValues.id)
      setValue('organizationId', defaultValues.organizationId)
    }
  }, [isCreateMode, defaultValues, setValue])

  const { data: fetchedData, loading } = useEntityGetOne<FormInput>(
    'membershipRole',
    isCreateMode ? undefined : membershipRoleId,
    { fieldConfig: typedConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<FormInput, FormInput>({
    entityType: 'membershipRole',
    entityId: isCreateMode ? undefined : membershipRoleId,
    existingData: isCreateMode ? undefined : fetchedData,
    resetForm: reset
  })

  useEffect(() => {
    if (!isCreateMode && fetchedData) {
      reset({
        ...defaultValues,
        ...fetchedData
      })
    }
  }, [fetchedData, reset, defaultValues, isCreateMode])

  const enumTypeKeys = typedConfig.map((field) => field.enumType).filter(Boolean) as string[]
  const { enumOptionsMap, loading: enumLoading } = useEnumOptionsMap(enumTypeKeys)

  if (loading || enumLoading) {
    return <p className="p-6">{t('common.loading')}</p>
  }

  return (
    <ComponentCard title={t('membershipRole.title')}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DynamicFormRenderer<FormInput>
          fieldConfig={typedConfig}
          groupOrder={membershipRoleFieldGroupOrder}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{} as Record<keyof FormInput, any>}
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

export default MembershipRoleForm
