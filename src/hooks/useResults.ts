import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';

export const useResults = (role?: string, userId?: string) => {
    return useQuery({
        queryKey: ['results', role, userId],
        queryFn: async () => {
            if (role === 'student' && userId) {
                const { data } = await databaseService.getResultsByStudent(userId);
                return data || [];
            } else {
                // Admin/Teacher sees all
                const { data } = await databaseService.getAllResults();
                return data || [];
            }
        },
        enabled: !!role,
    });
};
