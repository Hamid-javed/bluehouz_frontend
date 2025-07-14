// File: src/components/form/JoinExistingForm.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import Input from '@/components/form/input/InputField'
import Button from '@/components/ui/button/Button'
import ComponentCard from '@/components/common/ComponentCard'
import { useRouter } from 'next/navigation'

type JoinFormInput = {
  invitationToken: string
}

const JoinExistingForm: React.FC = () => {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<JoinFormInput>({
    mode: 'onBlur'
  })

  const onSubmit = async (data: JoinFormInput) => {
    if (!data.invitationToken || data.invitationToken.length < 6) {
      alert('Invitation code is too short')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organization/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Invalid or expired invitation token')
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Join error:', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unknown error occurred')
      }
    }
  }

  return (
    <ComponentCard title="Join an Existing Organization">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Input
            id="invitationToken"
            label="Invitation Code"
            placeholder="Enter your invitation token"
            {...register('invitationToken')}
            errorMessage={errors.invitationToken?.message || ''}
          />
          <div className="mt-6">
            <Button type="submit" variant="primary" size="md">
              Join Organization
            </Button>
          </div>
        </div>
      </form>
    </ComponentCard>
  )
}

export default JoinExistingForm
