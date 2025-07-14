// File: src/hooks/useEntityPut.ts

import { useState, useCallback } from 'react';
import apiHandler from '@/services/apihandler';
import { useAuth } from '@/context/AuthProvider';
import { useSnackbar } from '@/context/SnackbarContext';

export const useEntityPut = <T extends object>(entity: string) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const {  setRowPendingDelete } = useAuth()


  const replaceEntity = useCallback(
    async (id: string, payload: T, options?: { previous?: T; undo?: () => void }) => {
      setLoading(true);
      setError(null);
      const start = performance.now();

      try {
        console.log('[useEntityPut] Sending PUT:', { entity, id, payload });

        const response = await apiHandler<T>(
          'PUT',
          `/api/entity/${entity}/${id}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json', // restore what Axios would set
            }
          }
        );

        const duration = performance.now() - start;
        console.log(`[useEntityPut] ✅ PUT ${entity}/${id} completed in ${duration.toFixed(1)}ms`);

        setData(response);
        showSnackbar(`${entity} replaced successfully.`, 'success', options?.undo);
        return response
      } catch (err) {
        const duration = performance.now() - start;
        console.error(`[useEntityPut] ❌ PUT ${entity}/${id} failed in ${duration.toFixed(1)}ms`, err);

        setError(err);
        showSnackbar(`Failed to replace ${entity}.`, 'error');
      } finally {
        setLoading(false);
        setRowPendingDelete(null);       
      }
    },
    [entity, showSnackbar]
  );

  return { replaceEntity, data, error, loading };
};
