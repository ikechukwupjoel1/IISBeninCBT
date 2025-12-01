import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherDashboard from '../components/TeacherDashboard';
import { databaseService } from '../services/databaseService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SkipLink } from '../components/ui/SkipLink';
import { useExams } from '../hooks/useExams';
import { useResults } from '../hooks/useResults';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';

export const TeacherDashboardPage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [globalLogo, setGlobalLogo] = useState<string>('');

    // React Query Hooks
    const { data: exams = [], isLoading: examsLoading, refetch: refetchExams } = useExams();
    const { data: results = [], isLoading: resultsLoading, refetch: refetchResults } = useResults();

    const isLoading = examsLoading || resultsLoading;

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
            <TeacherDashboard
                onLogout={handleLogout}
                teacherName={currentUser.name}
                teacherId={currentUser.id}
                exams={exams}
                onRefreshData={handleRefreshData}
                results={results}
                globalLogo={globalLogo}
            />
        </>
    );
};
