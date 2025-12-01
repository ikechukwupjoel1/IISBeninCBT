import React from 'react';
import { Icons } from './Icons';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Icons.Spinner className="w-12 h-12 text-brand-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
};
