import React, { createContext, useContext, useState } from 'react';
import { ToastContainer, ToastType } from '../components/ui/Toast';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg: string) => showToast(msg, 'success');
    const error = (msg: string) => showToast(msg, 'error');
    const warning = (msg: string) => showToast(msg, 'warning');
    const info = (msg: string) => showToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
