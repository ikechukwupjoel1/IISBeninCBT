import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExamSession from '../components/ExamSession';
import { databaseService } from '../services/databaseService';
import { explainPerformance } from '../services/geminiService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../hooks/useExams';

export const ExamPage: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const { data: exam, isLoading, error } = useExam(examId || '');

    if (isLoading) return <div>Loading exam...</div>;
    if (error || !exam) {
        return <div>Error loading exam or exam not found.</div>;
    }
    if (!currentUser) return null;

    const calculateGrade = (score: number, total: number) => {
        if (total === 0) return 'N/A';
        const percentage = (score / total) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const handleExamSubmit = async (answers: Record<string, any>) => {
        try {
            // Calculate score
            let score = 0;
            const total = exam.questions.length;

            exam.questions.forEach((question: any) => {
                const userAnswer = answers[question.id];
                if (userAnswer === question.correctAnswer) {
                    score++;
                }
            });

            // Calculate grade
            const grade = calculateGrade(score, total);

            // Get AI feedback
            let feedback = 'Great effort! Keep practicing to improve your performance.';
            try {
                const percentage = (score / total) * 100;
                feedback = await explainPerformance(exam.subject, percentage);
            } catch (error) {
                console.error('AI feedback failed:', error);
            }

            // Save result to database
            try {
                await databaseService.submitExamResult({
                    examId: exam.id,
                    studentId: currentUser.id,
                    score,
                    totalScore: total,
                    answers,
                    grade,
                    subject: exam.subject,
                    examTitle: exam.title
                });
            } catch (error) {
                console.error('Failed to save result:', error);
                showError('Result saved locally but failed to sync to database');
            }

            // Navigate to result page with state
            const resultData = {
                score,
                total,
                feedback,
                grade,
                subject: exam.subject,
                questions: exam.questions,
                answers
            };

            success(`Exam submitted! You scored ${score}/${total}`);
            navigate('/result', { state: { result: resultData } });

        } catch (error) {
            console.error('Error submitting exam:', error);
            showError('Failed to submit exam. Please try again.');
        }
    };

    return (
        <ExamSession
            exam={exam}
            student={currentUser}
            onSubmit={handleExamSubmit}
        />
    );
};
