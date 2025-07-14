// File: bluehouz_frontend\src\hooks\useEntityPost.ts

'use client';

import { useState, useCallback } from 'react';
import apiHandler from '@/services/apihandler';
import { useSnackbar } from '@/context/SnackbarContext';

export const useEntityPost = <T extends object>(
  entity: string,
  basePath?: string
) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);

  const postEntity = useCallback(
    async (payload: T) => {
      setLoading(true);
      setError(null);
      try {
        const url = basePath ? `${basePath}/${entity}` : `/api/entity/${entity}`;

        const response = await apiHandler<T>(
          'POST',
          url,
          payload,
        );
        setData(response);
        showSnackbar(`${entity} created successfully.`, 'success');
        return response
      } catch (err: any) {
        setError(err);
        showSnackbar(`Failed to create ${entity}.`, 'error');
        console.error(`❌ Failed to create ${entity}:`, err);
        return undefined
      } finally {
        setLoading(false);
      }
    },
    [entity, showSnackbar, basePath]
  );

  return { postEntity, data, error, loading };
};
