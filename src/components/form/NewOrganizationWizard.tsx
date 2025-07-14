// File: src/components/form/NewOrganizationWizard.tsx

'use client'

import React, { useMemo } from 'react'
import { useForm, SubmitHandler, UseFormWatch, FieldValues } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'

import {
  contactFieldConfig,
  contactFieldGroupOrder
} from '@shared/config/contactFieldConfig'
import {
  extractEnumKeys
} from '@/lib/schemaUtils'
import { getValidationRulesFromFieldConfig } from '@/lib/getValidationRulesFromFieldConfig'
import { useEnumOptionsMap } from '@/hooks/useEnumOptions'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import DynamicFormRenderer from '@/components/form/render/DynamicFormRenderer'

type ContactFormInput = Record<string, any>

const getDefaultValuesFromConfig = (
  config: typeof contactFieldConfig
): ContactFormInput => {
  const defaults: ContactFormInput = {}
  for (const field of config) {
    if (field.defaultValue !== undefined) {
      defaults[field.name as string] = field.defaultValue
    }
  }
  defaults['isTenantOrganization'] = true
  defaults['organizationId'] = undefined
  return defaults
}

const getContactTypeGroup = (
  contactTypeId: string | undefined,
  enumMap: Record<string, any>
): 'Person' | 'Organization' | null => {
  if (contactTypeId === enumMap.contactType?.person) return 'Person'
  if (contactTypeId === enumMap.contactType?.organization) return 'Organization'
  return null
}

const NewOrganizationWizard: React.FC = () => {
  const router = useRouter()
  const { token } = useAuth()

  const defaultValues = useMemo(() => getDefaultValuesFromConfig(contactFieldConfig), [])

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors }
  } = useForm<ContactFormInput>({
    defaultValues,
    mode: 'onBlur'
  })

  const enumTypeKeys = extractEnumKeys(contactFieldConfig)
  const { enumOptionsMap, enumValueMap } = useEnumOptionsMap(enumTypeKeys)

  const contactTypeId = watch('contactTypeId')?.toString()
  const contactGroup = getContactTypeGroup(contactTypeId, enumValueMap)

  const visibleGroups = contactFieldGroupOrder.filter((group) =>
    group === 'Person'
      ? contactGroup === 'Person'
      : group === 'Organization'
      ? contactGroup === 'Organization'
      : true
  )

  const filteredFieldConfig = contactFieldConfig.filter(f => f.name !== 'organizationId')

  const onSubmit: SubmitHandler<ContactFormInput> = async (data) => {
    if (!token) {
      alert('No authentication token found. Please sign in again.')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const responseBody = await response.text()
        console.error('❌ Server responded with:', response.status, responseBody)
        throw new Error('Failed to create organization')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Org creation error:', error)
      if (error instanceof Error) alert(error.message)
    }
  }

  const onError = (formErrors: any) => {
    console.error('❌ Validation failed:', formErrors)
    alert('Please fix validation errors before submitting.')
  }

  return (
    <ComponentCard title="Create New Organization">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <DynamicFormRenderer<ContactFormInput>
          fieldConfig={filteredFieldConfig}
          groupOrder={visibleGroups}
          register={register}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          enumOptionsMap={enumOptionsMap}
          fieldMeta={{}} // no more schema-based meta
        />
        <div className="mt-6">
          <Button type="submit" variant="primary" size="md">
            Create Organization
          </Button>
        </div>
      </form>
    </ComponentCard>
  )
}

export default NewOrganizationWizard
