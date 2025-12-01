import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types';
import { databaseService } from './services/databaseService';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy load pages
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const TeacherDashboardPage = lazy(() => import('./pages/TeacherDashboardPage').then(module => ({ default: module.TeacherDashboardPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then(module => ({ default: module.StudentDashboardPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then(module => ({ default: module.ExamPage })));
const ExamResultPage = lazy(() => import('./pages/ExamResultPage').then(module => ({ default: module.ExamResultPage })));

const App: React.FC = () => {
  const [globalLogo, setGlobalLogo] = useState<string>('');

  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const { data: logoUrl } = await databaseService.getSetting('global_logo');
        if (logoUrl) {
          setGlobalLogo(logoUrl);
        }
      } catch (error) {
        console.error('Failed to load global settings:', error);
      }
    };
    loadGlobalSettings();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login globalLogo={globalLogo} setGlobalLogo={setGlobalLogo} />} />

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                  </Route>

                  {/* Teacher Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.TEACHER]} />}>
                    <Route path="/teacher" element={<TeacherDashboardPage />} />
                  </Route>

                  {/* Student Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
                    <Route path="/student" element={<StudentDashboardPage />} />
                    <Route path="/exam/:examId" element={<ExamPage />} />
                    <Route path="/result" element={<ExamResultPage />} />
                  </Route>

                  {/* Default Route */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;