import { supabase } from './supabaseClient';

export interface ClassPerformance {
    className: string;
    averageScore: number;
    passRate: number;
    totalStudents: number;
    totalExams: number;
}

export interface ExamStatistics {
    totalExams: number;
    totalAttempts: number;
    averageScore: number;
    participationRate: number;
    completionRate: number;
}

export interface StudentProgress {
    examId: string;
    examTitle: string;
    subject: string;
    score: number;
    totalScore: number;
    percentage: number;
    submittedAt: string;
    grade: string;
}

export interface QuestionAnalytics {
    questionId: string;
    questionText: string;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime?: number;
}

export const reportingService = {
    /**
     * Get class performance metrics
     */
    async getClassPerformance(dateRange?: { start: string; end: string }): Promise<ClassPerformance[]> {
        try {
            let query = supabase
                .from('exam_results')
                .select(`
          score,
          total_score,
          users!inner(grade)
        `);

            if (dateRange) {
                query = query
                    .gte('submitted_at', dateRange.start)
                    .lte('submitted_at', dateRange.end);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Group by class/grade
            const classMap = new Map<string, { scores: number[], totalScores: number[], students: Set<string> }>();

            data?.forEach((result: any) => {
                const grade = result.users?.grade || 'Unknown';
                if (!classMap.has(grade)) {
                    classMap.set(grade, { scores: [], totalScores: [], students: new Set() });
                }
                const classData = classMap.get(grade)!;
                classData.scores.push(result.score);
                classData.totalScores.push(result.total_score);
            });

            // Calculate metrics
            const performance: ClassPerformance[] = [];
            classMap.forEach((data, className) => {
                const percentages = data.scores.map((score, idx) => (score / data.totalScores[idx]) * 100);
                const averageScore = percentages.reduce((a, b) => a + b, 0) / percentages.length;
                const passRate = (percentages.filter(p => p >= 50).length / percentages.length) * 100;

                performance.push({
                    className,
                    averageScore: Math.round(averageScore),
                    passRate: Math.round(passRate),
                    totalStudents: data.students.size,
                    totalExams: data.scores.length
                });
            });

            return performance.sort((a, b) => b.averageScore - a.averageScore);
        } catch (error) {
            console.error('Error fetching class performance:', error);
            return [];
        }
    },

    /**
     * Get exam statistics
     */
    async getExamStatistics(dateRange?: { start: string; end: string }): Promise<ExamStatistics> {
        try {
            let examQuery = supabase.from('exams').select('id, status');
            let resultQuery = supabase.from('exam_results').select('score, total_score, status');

            if (dateRange) {
                resultQuery = resultQuery
                    .gte('submitted_at', dateRange.start)
                    .lte('submitted_at', dateRange.end);
            }

            const [examsResponse, resultsResponse] = await Promise.all([
                examQuery,
                resultQuery
            ]);

            if (examsResponse.error) throw examsResponse.error;
            if (resultsResponse.error) throw resultsResponse.error;

            const totalExams = examsResponse.data?.length || 0;
            const results = resultsResponse.data || [];
            const totalAttempts = results.length;

            const percentages = results.map(r => (r.score / r.total_score) * 100);
            const averageScore = percentages.length > 0
                ? percentages.reduce((a, b) => a + b, 0) / percentages.length
                : 0;

            const completedResults = results.filter(r => r.status === 'COMPLETED');
            const completionRate = totalAttempts > 0
                ? (completedResults.length / totalAttempts) * 100
                : 0;

            return {
                totalExams,
                totalAttempts,
                averageScore: Math.round(averageScore),
                participationRate: 0, // Would need student count
                completionRate: Math.round(completionRate)
            };
        } catch (error) {
            console.error('Error fetching exam statistics:', error);
            return {
                totalExams: 0,
                totalAttempts: 0,
                averageScore: 0,
                participationRate: 0,
                completionRate: 0
            };
        }
    },

    /**
     * Get student progress over time
     */
    async getStudentProgress(studentId: string): Promise<StudentProgress[]> {
        try {
            const { data, error } = await supabase
                .from('exam_results')
                .select(`
          id,
          score,
          total_score,
          submitted_at,
          grade,
          exams!inner(id, title, subject)
        `)
                .eq('student_id', studentId)
                .order('submitted_at', { ascending: true });

            if (error) throw error;

            return (data || []).map((result: any) => ({
                examId: result.exams?.id || '',
                examTitle: result.exams?.title || 'Unknown Exam',
                subject: result.exams?.subject || 'Unknown',
                score: result.score,
                totalScore: result.total_score,
                percentage: Math.round((result.score / result.total_score) * 100),
                submittedAt: result.submitted_at,
                grade: result.grade || 'N/A'
            }));
        } catch (error) {
            console.error('Error fetching student progress:', error);
            return [];
        }
    },

    /**
     * Get question analytics for a teacher
     */
    async getQuestionAnalytics(teacherId: string): Promise<QuestionAnalytics[]> {
        try {
            // This would require a more complex query joining exam_results with question_responses
            // For now, return mock data structure
            const { data: exams } = await supabase
                .from('exams')
                .select('id, questions')
                .eq('created_by', teacherId);

            // In a real implementation, you'd analyze question_responses table
            // to calculate success rates per question

            return [];
        } catch (error) {
            console.error('Error fetching question analytics:', error);
            return [];
        }
    },

    /**
     * Export data to CSV format
     */
    exportToCSV(data: any[], filename: string) {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
