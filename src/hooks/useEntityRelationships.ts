// hooks/useEntityRelationships.ts
import { useEntityGetAll } from './useEntityGetAll';

export const useEntityRelationships = (entityName: string) => {
    return useEntityGetAll('entityRelationship', {
        sourceEntity: entityName
    });
};
