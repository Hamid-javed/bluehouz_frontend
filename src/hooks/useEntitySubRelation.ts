import apiHandler from '@/services/apihandler';

export const fetchEntityGetAll = async <T>(
    entity: string,
    query?: Record<string, string | number>
): Promise<T[]> => {

    try {
        const queryString = query
            ? '?' + new URLSearchParams(query as Record<string, string>).toString()
            : '';

        const response = await apiHandler<T[]>(
            'GET',
            `/api/entity/${entity}${queryString}`,
            undefined,
        );
        return response;
    } catch (err) {
        console.error(`Failed to fetch ${entity}`, err);
        return [];
    }
};
