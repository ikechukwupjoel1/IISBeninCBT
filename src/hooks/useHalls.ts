import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';

export const useHalls = () => {
    return useQuery({
        queryKey: ['halls'],
        queryFn: async () => {
            const { data } = await databaseService.getAllHalls();
            return data ? data.map((h: any) => h.name) : [];
        },
    });
};
