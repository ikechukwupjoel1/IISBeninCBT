import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from '../components/StudentDashboard';
import { databaseService } from '../services/databaseService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SkipLink } from '../components/ui/SkipLink';
import { useExams } from '../hooks/useExams';
import { useResults } from '../hooks/useResults';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';

export const StudentDashboardPage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [globalLogo, setGlobalLogo] = useState<string>('');

    // React Query Hooks
    const { data: exams = [], isLoading: examsLoading, refetch: refetchExams } = useExams('student', currentUser?.grade);
    const { data: results = [], isLoading: resultsLoading, refetch: refetchResults } = useResults('student', currentUser?.id);

    const isLoading = examsLoading || resultsLoading;

    // Derive completed attempts from results
    const completedAttempts = results.map((r: any) => r.exam_id);

    useEffect(() => {
        loadGlobalLogo();
    }, []);

    const loadGlobalLogo = async () => {
        try {
            const { data: logoUrl } = await databaseService.getSetting('global_logo');
            if (logoUrl) setGlobalLogo(logoUrl);
        } catch (error) {
            console.error('Error loading logo:', error);
        }
    };

    const handleStartExam = (exam: any) => {
        navigate(`/exam/${exam.id}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleRefreshData = () => {
        refetchExams();
        refetchResults();
    };

    if (!currentUser) return null;
    if (isLoading) return <DashboardSkeleton />;

    return (
        <>
            <SkipLink />
            <StudentDashboard
                student={currentUser}
                exams={exams}
                results={results}
                completedExamIds={completedAttempts}
                onStartExam={handleStartExam}
                onLogout={handleLogout}
                globalLogo={globalLogo}
                onRefreshData={handleRefreshData}
            />
        </>
    );
};
