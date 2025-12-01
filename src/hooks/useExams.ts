import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { databaseService } from '../services/databaseService';
import { Exam } from '../types';

export const useExams = (role?: string, grade?: string) => {
    return useQuery({
        queryKey: ['exams', role, grade],
        queryFn: async () => {
            if (role === 'student' && grade) {
                const { data: studentExams } = await databaseService.getExamsByClass(grade);
                if (!studentExams) return [];

                // Fetch questions for each exam (if needed for list view, though usually not)
                // Optimization: Maybe only fetch full exam details when starting an exam?
                // For now, keeping existing logic but optimized with Promise.all
                const examsWithQuestions = await Promise.all(
                    studentExams.map(async (exam: any) => {
                        const { data: examWithQuestions } = await databaseService.getExamById(exam.id);
                        return examWithQuestions;
                    })
                );
                return examsWithQuestions.filter(Boolean);
            } else {
                // Admin/Teacher sees all
                const { data: allExams } = await databaseService.getAllExams();
                if (!allExams) return [];

                const examsWithQuestions = await Promise.all(
                    allExams.map(async (exam: any) => {
                        const { data: examWithQuestions } = await databaseService.getExamById(exam.id);
                        return examWithQuestions;
                    })
                );
                return examsWithQuestions.filter(Boolean);
            }
        },
        enabled: !!role, // Only run if role is defined
    });
};

export const useExam = (examId: string) => {
    return useQuery({
        queryKey: ['exam', examId],
        queryFn: async () => {
            const { data } = await databaseService.getExamById(examId);
            if (!data) throw new Error('Exam not found');
            return data;
        },
        enabled: !!examId,
    });
};
