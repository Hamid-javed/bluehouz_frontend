'use client';

// File: src/hooks/useEntityDelete.ts

import { useState, useCallback } from 'react'
import apiHandler from '@/services/apihandler'
import { useSnackbar } from '@/context/SnackbarContext'
import { useAuth } from '@/context/AuthProvider';

export const useEntityDelete = (
  entity: string,
  basePath?: string
) => {
  const { showSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const {  setRowPendingDelete } = useAuth()


  const deleteEntity = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const url = basePath ? `${basePath}/${entity}/${id}` : `/api/entity/${entity}/${id}`;

        await apiHandler(
          'DELETE',
          url,
          undefined,
        )

        showSnackbar(`${entity} deleted successfully.`, 'success')
      } catch (err) {
        setError(err)
        console.error(`❌ Failed to delete ${entity}/${id}:`, err)
        showSnackbar(`Failed to delete ${entity}.`, 'error')
      } finally {
        setLoading(false)
        setRowPendingDelete(null);       
      }
    },
    [entity, showSnackbar, basePath]
  )

  return { deleteEntity, loading, error }
}
