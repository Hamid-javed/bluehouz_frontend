// File: bluehouz_frontend/src/hooks/useEntityFormSubmit.ts

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useEntityPost } from '@/hooks/useEntityPost'
import { useEntityPatch } from '@/hooks/useEntityPatch'
import { useSnackbar } from '@/context/SnackbarContext'

type EntityData = Record<string, unknown>

interface UseEntityFormSubmitProps<
  TInput extends Record<string, any>,
  TNormalized extends EntityData
> {
  entityType: string
  entityId?: string
  existingData?: unknown
  resetForm: (values: Partial<TInput>) => void
  visibleFieldNames?: (keyof TInput)[]
}

function isSameValue(a: any, b: any): boolean {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (a === undefined || a === null || a === '') return b === undefined || b === null || b === ''
  if (b === undefined || b === null || b === '') return a === undefined || a === null || a === ''
  return false
}

function getChangedFields<T extends Record<string, any>>(
  previous: T,
  current: T
): Partial<T> {
  const changes: Partial<T> = {}
  for (const key of Object.keys(current)) {
    const prev = previous[key as keyof T]
    const curr = current[key as keyof T]
    if (!isSameValue(prev, curr)) {
      changes[key as keyof T] = curr
    }
  }
  return changes
}

function filterVisibleFields<T extends Record<string, any>>(
  data: T,
  allowed: (keyof T)[]
): Partial<T> {
  const filtered: Partial<T> = {}
  for (const key of allowed) {
    if (key in data) filtered[key] = data[key]
  }
  return filtered
}

export const useEntityFormSubmit = <
  TInput extends Record<string, any>,
  TNormalized extends EntityData
>({
  entityType,
  entityId,
  existingData,
  resetForm,
  visibleFieldNames,
}: UseEntityFormSubmitProps<TInput, TNormalized>) => {
  const router = useRouter() // ← Added
  const { showSnackbar } = useSnackbar()
  const { postEntity, loading: creating } = useEntityPost<TNormalized>(entityType)
  const { patchEntity, loading: updating } = useEntityPatch<TNormalized>(entityType)

  const lastSubmittedRef = useRef<TNormalized | undefined>(undefined)
  const formDataRef = useRef<TInput | null>(null)

  useEffect(() => {
    if (existingData) {
      lastSubmittedRef.current = existingData as TNormalized
    }
  }, [existingData])

  const onSubmit = async (formData: TInput) => {
    let filteredFormData = formData
    if (visibleFieldNames?.length) {
      filteredFormData = filterVisibleFields(formData, visibleFieldNames) as TInput
    }

    formDataRef.current = filteredFormData
    const data = filteredFormData as unknown as TNormalized

    try {
      if (entityId) {
        const previous = lastSubmittedRef.current
        const delta = previous ? getChangedFields(previous, data) : data

        const isEmpty = Object.keys(delta).length === 0
        if (isEmpty) {
          showSnackbar('No changes to save.', 'info')
          return
        }

        await patchEntity(entityId, delta as TNormalized, {
          previous,
          undo: () => {
            if (previous && formDataRef.current) {
              const current = formDataRef.current as unknown as TNormalized
              const revertDelta = getChangedFields(current, previous)
              if (Object.keys(revertDelta).length > 0) {
                patchEntity(entityId, revertDelta as TNormalized)
              }
              resetForm(previous as Partial<TInput>)
              lastSubmittedRef.current = previous
            }
          }
        })

        lastSubmittedRef.current = data
        router.push(`/${entityType}`) // ← navigate after update

      } else {
        await postEntity(data)
        router.push(`/${entityType}`) // ← navigate after create
      }

    } catch (err) {
      console.error('[SUBMIT ERROR]', err)
      showSnackbar('An error occurred while saving.', 'error')
    }
  }

  return { onSubmit, creating, updating }
}