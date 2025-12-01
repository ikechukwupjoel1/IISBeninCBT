import React from 'react';
import { Skeleton } from './Skeleton';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
};
