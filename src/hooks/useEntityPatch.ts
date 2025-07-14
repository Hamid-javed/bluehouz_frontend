// File: src/hooks/useEntityPatch.ts

import { useState, useCallback } from 'react';
import apiHandler from '@/services/apihandler';
import { useSnackbar } from '@/context/SnackbarContext';

export const useEntityPatch = <T extends object>(
  entity: string,
  basePath?: string
) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  const patchEntity = useCallback(
    async (id: string, payload: T, options?: { previous?: T; undo?: () => void }) => {
      setLoading(true);
      setError(null);

      const start = performance.now();

      try {
        console.log('[useEntityPatch] Sending PATCH:', {
          entity,
          id,
          payload,
        });

        const url = basePath ? `${basePath}/${entity}/${id}` : `/api/entity/${entity}/${id}`;

        const response = await apiHandler<T>(
          'PATCH',
          url,
          payload,
        );

        const duration = performance.now() - start;
        console.log(`[useEntityPatch] ✅ PATCH ${entity}/${id} completed in ${duration.toFixed(1)}ms`);

        setData(response);

        showSnackbar(`${entity} updated successfully.`, 'success', options?.undo);
      } catch (err) {
        const duration = performance.now() - start;
        console.error(`[useEntityPatch] ❌ PATCH ${entity}/${id} failed in ${duration.toFixed(1)}ms`, err);

        setError(err);
        showSnackbar(`Failed to update ${entity}.`, 'error');
      } finally {
        setLoading(false);
      }
    },
    [entity, showSnackbar, basePath]
  );

  return { patchEntity, data, error, loading };
};
