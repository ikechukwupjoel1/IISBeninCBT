import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';

export const useInvigilators = () => {
    return useQuery({
        queryKey: ['invigilators'],
        queryFn: async () => {
            const { data } = await databaseService.getAllInvigilatorAssignments();
            return data || [];
        },
    });
};
