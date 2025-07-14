// File: bluehouz_frontend/src/hooks/useEntityGetAll.ts

import { useEffect, useState, useCallback } from 'react'
import apiHandler from '@/services/apihandler'
import { useSnackbar } from '@/context/SnackbarContext'

export const useEntityGetAll = <T>(
  entity: string,
  query?: Record<string, string | number | undefined>,
  skip?: boolean,
  base?: string,
) => {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const { showSnackbar } = useSnackbar()

  const fetchData = useCallback(async () => {
    if (!entity || skip) return

    const basepath = base ? `${base}/${entity}` : `/api/entity/${entity}`

    setLoading(true)
    try {
      const queryString =
        query && Object.keys(query).length > 0
          ? '?' + new URLSearchParams(query as Record<string, string>).toString()
          : ''

      const response = await apiHandler<T[]>(
        'GET',
        `${basepath}${queryString}`,
        undefined,
      )

      setData(response)
    } catch (err) {
      showSnackbar(`Failed to load ${entity} list.`, 'error')
    } finally {
      setLoading(false)
    }
  }, [entity, JSON.stringify(query), skip, showSnackbar])

  // Auto-fetch on mount and dependency change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}
