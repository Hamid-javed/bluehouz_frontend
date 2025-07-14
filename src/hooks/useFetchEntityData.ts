// utils/fetchEntityData.ts
import apiHandler from '@/services/apihandler'
import { useAuth } from '@/context/AuthProvider';

export const fetchEntityData = async <T>(
    entity: string,
    query?: Record<string, string | number | undefined>,

): Promise<T[]> => {
    // const { setFetchEntityLoading } = useAuth();
    // setFetchEntityLoading(true)
    const queryString =
        query && Object.keys(query).length > 0
            ? '?' + new URLSearchParams(query as Record<string, string>).toString()
            : ''

    const response = await apiHandler<T[]>(
        'GET',
        `/api/entity/${entity}${queryString}`,
        undefined,
    )

    // setFetchEntityLoading(false)

    return response
}
