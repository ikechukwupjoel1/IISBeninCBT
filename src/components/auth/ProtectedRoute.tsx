import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to appropriate dashboard based on role
        switch (currentUser.role) {
            case UserRole.ADMIN:
                return <Navigate to="/admin" replace />;
            case UserRole.TEACHER:
                return <Navigate to="/teacher" replace />;
            case UserRole.STUDENT:
                return <Navigate to="/student" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
};
