import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { reportingService, ClassPerformance, ExamStatistics } from '../services/reportingService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminReports: React.FC = () => {
    const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
    const [examStats, setExamStats] = useState<ExamStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'30' | '60' | '90' | 'all'>('30');

    useEffect(() => {
        loadReportData();
    }, [dateRange]);

    const loadReportData = async () => {
        setLoading(true);
        try {
            const range = dateRange !== 'all' ? {
                start: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            } : undefined;

            const [performance, stats] = await Promise.all([
                reportingService.getClassPerformance(range),
                reportingService.getExamStatistics(range)
            ]);

            setClassPerformance(performance);
            setExamStats(stats);
        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        reportingService.exportToCSV(classPerformance, `class-performance-${dateRange}days`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Icons.Spinner className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-brand-900">Reports & Analytics</h2>
                    <p className="text-slate-500">Comprehensive performance insights</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        <option value="30">Last 30 Days</option>
                        <option value="60">Last 60 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <Button onClick={handleExport} variant="outline">
                        <Icons.Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Exam Statistics Cards */}
            {examStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Exams</p>
                                <p className="text-3xl font-bold text-brand-900">{examStats.totalExams}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Icons.BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Attempts</p>
                                <p className="text-3xl font-bold text-brand-900">{examStats.totalAttempts}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Icons.Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Average Score</p>
                                <p className="text-3xl font-bold text-brand-900">{examStats.averageScore}%</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Icons.Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Completion Rate</p>
                                <p className="text-3xl font-bold text-brand-900">{examStats.completionRate}%</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Icons.CheckCircle className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Class Performance Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-brand-900 mb-4">Class Performance Overview</h3>
                {classPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={classPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="className" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="averageScore" fill="#4F46E5" name="Average Score %" />
                            <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <Icons.BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No data available for selected period</p>
                    </div>
                )}
            </Card>

            {/* Class Performance Table */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-brand-900 mb-4">Detailed Class Metrics</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-3 font-semibold text-slate-700">Class/Grade</th>
                                <th className="text-left p-3 font-semibold text-slate-700">Avg Score</th>
                                <th className="text-left p-3 font-semibold text-slate-700">Pass Rate</th>
                                <th className="text-left p-3 font-semibold text-slate-700">Total Exams</th>
                                <th className="text-left p-3 font-semibold text-slate-700">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classPerformance.map((cls, index) => (
                                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 font-medium">{cls.className}</td>
                                    <td className="p-3">{cls.averageScore}%</td>
                                    <td className="p-3">{cls.passRate}%</td>
                                    <td className="p-3">{cls.totalExams}</td>
                                    <td className="p-3">
                                        <Badge variant={cls.averageScore >= 70 ? 'success' : cls.averageScore >= 50 ? 'default' : 'danger'}>
                                            {cls.averageScore >= 70 ? 'Excellent' : cls.averageScore >= 50 ? 'Good' : 'Needs Improvement'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
