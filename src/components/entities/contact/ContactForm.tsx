// File: bluehouz_frontend/src/components/entities/contact/ContactForm.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
import { useForm, UseFormWatch, FieldValues } from 'react-hook-form'
import {
  contactFieldConfig,
  contactFieldGroupOrder,
} from '@shared/config/contactFieldConfig'
import { extractEnumKeys } from '@/lib/schemaUtils'
import { useEnumOptionsMap } from '@/hooks/useEnumOptions'
import { useEntityGetOne } from '@/hooks/useEntityGetOne'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'
import { useEntityFormSubmit } from '@/hooks/useEntityFormSubmit'
import { useTranslations } from 'next-intl'
import { FieldConfig as SharedFieldConfig } from '@shared/types/fieldConfig'
import { useAuth } from '@/context/AuthProvider'

interface ContactFormProps {
  contactId?: string
  submitLabel?: string
}

interface TypedFieldConfig<T extends FieldValues = any>
  extends SharedFieldConfig<T> {
  conditional?: (watch: UseFormWatch<T>) => boolean
}

// Derive default values from field config
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

// Conditional logic to hide Person/Organization fields
const getContactTypeGroup = (
  contactTypeId: string | undefined,
  enumMap: Record<string, any>
): 'Person' | 'Organization' | null => {
  if (contactTypeId === enumMap.contactType?.person) return 'Person'
  if (contactTypeId === enumMap.contactType?.organization) return 'Organization'
  return null
}

const ContactForm: React.FC<ContactFormProps> = ({ contactId, submitLabel }) => {
  const {  user } = useAuth()
  const t = useTranslations()
  const isCreateMode = !contactId || contactId === 'new'

  type ContactFormInput = Record<string, any>
  

  const typedContactFieldConfig = contactFieldConfig as TypedFieldConfig<Record<string, any>>[]
  const filteredContactFieldConfig = typedContactFieldConfig.filter(
    (col) =>
      !["organizationOrName", "createdAt", "name", "address", "organizationName"].includes(
        col.name as string
      )
  )

  const defaultValues = useMemo(() => {
    const defaults = getDefaultValuesFromConfig(typedContactFieldConfig)

    if (isCreateMode) {
      if (!defaults.organizationId) {
        defaults.organizationId = user?.currentOrganizationId
      }
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
  } = useForm<ContactFormInput>({
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (isCreateMode) {
      if (defaultValues.organizationId) {
        setValue('organizationId', defaultValues.organizationId)
      }
      if (defaultValues.id) {
        setValue('id', defaultValues.id)
      }
    }
  }, [isCreateMode, defaultValues, setValue])

  const { data: contactData, loading } = useEntityGetOne<ContactFormInput>(
    'contact',
    isCreateMode ? undefined : contactId,
    { fieldConfig: typedContactFieldConfig }
  )

  const { onSubmit, creating, updating } = useEntityFormSubmit<
    ContactFormInput,
    ContactFormInput
  >({
    entityType: 'contact',
    entityId: isCreateMode ? undefined : contactId,
    existingData: isCreateMode ? undefined : contactData,
    resetForm: reset,
  })

  useEffect(() => {
    if (!isCreateMode && contactData) {
      reset({
        ...defaultValues,
        ...contactData,
      })
    }
  }, [contactData, reset, defaultValues, isCreateMode])

  const enumTypeKeys = extractEnumKeys(contactFieldConfig)
  const { enumOptionsMap, enumValueMap, loading: enumLoading } =
    useEnumOptionsMap(enumTypeKeys)

  const contactTypeId = watch('contactTypeId')?.toString()
  const contactGroup = getContactTypeGroup(contactTypeId, enumValueMap)

  const visibleGroups = useMemo(() => {
    if (isCreateMode) return contactFieldGroupOrder

    return contactFieldGroupOrder.filter((group) =>
      group === 'Person'
        ? contactGroup === 'Person'
        : group === 'Organization'
          ? contactGroup === 'Organization'
          : true
    )
  }, [isCreateMode, contactGroup])

  if (loading || enumLoading) {
    return <p className="p-6">{t('common.loading')}</p>
  }
const onInvalid = (formErrors: any) => {
  console.warn('❌ Form validation failed:', formErrors)
}
  return (
    <ComponentCard title={t('contact.title')}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <DynamicFormRenderer<ContactFormInput>
          fieldConfig={
            isCreateMode ? filteredContactFieldConfig : typedContactFieldConfig
          }
          groupOrder={visibleGroups}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{} as Record<keyof ContactFormInput, any>}
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

export default ContactForm
