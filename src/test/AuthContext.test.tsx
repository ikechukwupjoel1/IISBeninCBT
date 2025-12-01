import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        signOut: vi.fn(),
    }
}));

// Test component to consume AuthContext
const TestComponent = () => {
    const { currentUser, login, logout, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {currentUser ? (
                <div>
                    <span data-testid="user-name">{currentUser.name}</span>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <button onClick={() => login({ id: '1', name: 'Test User', role: 'student' } as any)}>
                    Login Manually
                </button>
            )}
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('provides authentication state', async () => {
        (authService.getCurrentUser as any).mockResolvedValue(null);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Login Manually/i)).toBeInTheDocument();
        });
    });

    it('updates state on login', async () => {
        (authService.getCurrentUser as any).mockResolvedValue(null);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText(/Login Manually/i)).toBeInTheDocument();
        });

        const loginBtn = screen.getByText(/Login Manually/i);
        act(() => {
            loginBtn.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        });
    });

    it('handles logout', async () => {
        const mockUser = { id: '1', name: 'Test User', role: 'student' };
        (authService.getCurrentUser as any).mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        });

        const logoutBtn = screen.getByText(/Logout/i);
        await act(async () => {
            logoutBtn.click();
        });

        expect(authService.signOut).toHaveBeenCalled();
        await waitFor(() => {
            expect(screen.getByText(/Login Manually/i)).toBeInTheDocument();
        });
    });

    it('checks session on mount', async () => {
        const mockUser = { id: '1', name: 'Session User', role: 'student' };
        (authService.getCurrentUser as any).mockResolvedValue(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-name')).toHaveTextContent('Session User');
        });
        expect(authService.getCurrentUser).toHaveBeenCalled();
    });
});
