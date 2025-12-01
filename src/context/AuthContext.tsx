import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (user: User) => void;
    logout: () => void;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        setLoading(true);
        try {
            const user = await authService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
        } catch (error) {
            console.error('Session check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
    };

    const logout = async () => {
        await authService.signOut();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
