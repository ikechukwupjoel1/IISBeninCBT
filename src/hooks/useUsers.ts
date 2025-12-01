import { useQuery } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await databaseService.getAllUsers();
            return data || [];
        },
    });
};
