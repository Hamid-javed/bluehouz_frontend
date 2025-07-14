// File: bluehouz_frontend/src/components/entities/membership/MembershipForm.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'
import { useEntityGetOne } from '@/hooks/useEntityGetOne'
import { useEntityFormSubmit } from '@/hooks/useEntityFormSubmit'
import { useTranslations } from 'next-intl'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'
import { membershipFieldConfig, membershipFieldGroupOrder } from '@shared/config/membershipFieldConfig'

interface MembershipFormProps {
  membershipId?: string
  submitLabel?: string
}

interface TypedFieldConfig<T extends FieldValues = any> extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
}

// Derive default values from field config
const getDefaultValuesFromConfig = (config: SharedFieldConfig[]): Record<string, any> => {
  const values: Record<string, any> = {}
  for (const field of config) {
    if (field.defaultValue !== undefined) {
      values[field.name as string] = field.defaultValue
    }
  }
  return values
}

const MembershipForm: React.FC<MembershipFormProps> = ({ membershipId, submitLabel }) => {
  const t = useTranslations()

  type MembershipFormInput = Record<string, any>

  const defaultValues = useMemo(
    () => getDefaultValuesFromConfig(membershipFieldConfig),
    []
  )

  const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<MembershipFormInput>({
    defaultValues,
    mode: 'onBlur',
  })

  const isCreateMode = !membershipId || membershipId === 'new'

  const { data: membershipData, loading } = useEntityGetOne<MembershipFormInput>(
    'membership',
    isCreateMode ? undefined : membershipId,
    { fieldConfig: membershipFieldConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<MembershipFormInput, MembershipFormInput>({
    entityType: 'membership',
    entityId: isCreateMode ? undefined : membershipId,
    existingData: isCreateMode ? undefined : membershipData,
    resetForm: reset,
  })

  useEffect(() => {
    if (!isCreateMode && membershipData) {
      console.log('Fetched membershipData:', membershipData)
      // In case API returns snake_case keys, map to camelCase
      const mappedData = {
        ...membershipData,
        userId: membershipData.userId ?? membershipData.user_id,
        contactId: membershipData.contactId ?? membershipData.contact_id,
        organizationId: membershipData.organizationId ?? membershipData.organization_id,
        isDefault: membershipData.isDefault ?? membershipData.is_default,
        createdAt: membershipData.createdAt ?? membershipData.created_at,
      }
      console.log('Mapped membershipData:', mappedData)
      reset({
        ...defaultValues,
        ...mappedData,
      })
    }
  }, [membershipData, reset, defaultValues, isCreateMode])

  if (loading) return <p className="p-6">{t('common.loading')}</p>

  return (
    <ComponentCard title={t('membership.title', { defaultValue: 'Membership' })}>
      <form onSubmit={handleSubmit((formData) => {
        onSubmit(formData)
      })}>
        <DynamicFormRenderer<MembershipFormInput>
          fieldConfig={membershipFieldConfig as TypedFieldConfig<Record<string, any>>[]}
          groupOrder={membershipFieldGroupOrder}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={{}} // Can add enum support later
          fieldMeta={{} as Record<keyof MembershipFormInput, any>}
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

export default MembershipForm
