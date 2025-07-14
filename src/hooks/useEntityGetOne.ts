'use client';

// File: src/hooks/useEntityGetOne.ts

import { useEffect, useState } from 'react'
import apiHandler from '@/services/apihandler'
import { useSnackbar } from '@/context/SnackbarContext'
import { normalizeValueByType } from '@shared/utils/normalizer'
import { FieldConfig } from '@shared/types/fieldConfig'

interface UseEntityGetOneOptions {
  fieldConfig?: FieldConfig<any>[]
}

export const useEntityGetOne = <T>(
  entity: string,
  id?: string,
  options?: UseEntityGetOneOptions
) => {
  const [loading, setLoading] = useState(!!id)
  const [data, setData] = useState<T | null>(null)
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    if (!id) {
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await apiHandler<T>(
          'GET',
          `/api/entity/${entity}/${id}`,
          undefined
        )

        let normalized = response

        if (options?.fieldConfig) {
          const normalizedEntity: any = {}

          for (const key in response) {
            const rawValue = response[key]
            const field = options.fieldConfig.find((f) => f.name === key)

            if (!field) {
              normalizedEntity[key] = rawValue
              continue
            }

            const valueType = field.valueType ?? 'text'
            const parsed = normalizeValueByType(rawValue, valueType)
            normalizedEntity[key] = parsed
          }

          normalized = normalizedEntity
        }

        setData(normalized)
      } catch (err) {
        showSnackbar(`Failed to load ${entity} data.`, 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [entity, id, options?.fieldConfig, showSnackbar])

  return { data, loading }
}
