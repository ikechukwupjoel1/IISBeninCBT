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
    const [isCheckingIp, setIsCheckingIp] = React.useState(true);
    const [ipError, setIpError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const checkIp = async () => {
            if (!exam) return;

            // Only check IP for EXAM type
            if (exam.type === 'EXAM' && exam.allowedIps && exam.allowedIps.length > 0) {
                try {
                    const response = await fetch('https://api.ipify.org?format=json');
                    const data = await response.json();
                    const clientIp = data.ip;

                    if (!exam.allowedIps.includes(clientIp)) {
                        setIpError(`Access Denied. This exam can only be taken from the school network. Your IP: ${clientIp}`);
                    }
                } catch (err) {
                    console.error('Failed to verify IP:', err);
                }
            }
            setIsCheckingIp(false);
        };

        if (exam) {
            checkIp();
        }
    }, [exam]);

    if (isLoading || isCheckingIp) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Verifying exam environment...</p>
            </div>
        </div>
    );

    if (error || !exam) {
        return <div>Error loading exam or exam not found.</div>;
    }

    if (ipError) {
        return (
            <div className="flex items-center justify-center h-screen bg-red-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border-2 border-red-100">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
                    <p className="text-slate-600 mb-6">{ipError}</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors w-full"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
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

                // Handle different question types for scoring
                if (Array.isArray(question.correctAnswer)) {
                    // Multi-select or other array-based answers
                    if (Array.isArray(userAnswer)) {
                        // Check if arrays match (order independent for multi-select usually, but let's sort)
                        const sortedCorrect = [...question.correctAnswer].sort();
                        const sortedUser = [...userAnswer].sort();
                        if (JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser)) {
                            score++;
                        }
                    }
                } else {
                    // Standard string comparison
                    if (userAnswer === question.correctAnswer) {
                        score++;
                    }
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
