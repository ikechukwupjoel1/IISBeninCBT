import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import { databaseService } from '../services/databaseService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { SkipLink } from '../components/ui/SkipLink';
import { useExams } from '../hooks/useExams';
import { useUsers } from '../hooks/useUsers';
import { useHalls } from '../hooks/useHalls';
import { useInvigilators } from '../hooks/useInvigilators';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';

export const AdminDashboardPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();

    const [globalLogo, setGlobalLogo] = useState<string>('');

    // React Query Hooks
    const { data: exams = [], isLoading: examsLoading, refetch: refetchExams } = useExams();
    const { data: users = [], isLoading: usersLoading, refetch: refetchUsers } = useUsers();
    const { data: halls = [], isLoading: hallsLoading, refetch: refetchHalls } = useHalls();
    const { data: invigilators = [], isLoading: invigilatorsLoading, refetch: refetchInvigilators } = useInvigilators();

    const isLoading = examsLoading || usersLoading || hallsLoading || invigilatorsLoading;

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

    const handleLogoUpdate = async (logoUrl: string) => {
        setGlobalLogo(logoUrl);
        try {
            await databaseService.updateSetting('global_logo', logoUrl);
            success('Logo updated successfully!');
        } catch (error) {
            console.error('Failed to save logo:', error);
            showError('Logo displayed but failed to save to database');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUpdateExams = () => refetchExams();
    const handleUpdateUsers = () => refetchUsers();
    const handleUpdateHalls = () => refetchHalls();
    const handleUpdateInvigilators = () => refetchInvigilators();

    if (isLoading) return <DashboardSkeleton />;

    return (
        <>
            <SkipLink />
            <AdminDashboard
                onLogout={handleLogout}
                exams={exams}
                onUpdateExams={handleUpdateExams}
                globalLogo={globalLogo}
                onUpdateLogo={handleLogoUpdate}
                users={users}
                onUpdateUsers={handleUpdateUsers}
                halls={halls}
                onUpdateHalls={handleUpdateHalls}
                invigilators={invigilators}
                onUpdateInvigilators={handleUpdateInvigilators}
            />
        </>
    );
};
