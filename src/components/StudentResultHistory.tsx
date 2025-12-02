import React, { useState } from 'react';
import { Card, Badge, Button, Input } from './ui/UI';
import { Icons } from './ui/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultHistoryProps {
    results: any[];
    studentName: string;
}

export const StudentResultHistory: React.FC<ResultHistoryProps> = ({ results, studentName }) => {
    const [filterSubject, setFilterSubject] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

    // Get unique subjects
    const subjects = Array.from(new Set(results.map(r => r.subject)));

    // Filter and sort results
    const filteredResults = results
        .filter(r => !filterSubject || r.subject === filterSubject)
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
            }
            return b.score - a.score;
        });

    // Prepare data for trend chart
    const trendData = filteredResults
        .slice(0, 10)
        .reverse()
        .map(r => ({
            date: new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.round((r.score / r.total_score) * 100),
            exam: r.exam_title
        }));

    // Calculate statistics
    const avgScore = filteredResults.length > 0
        ? Math.round(filteredResults.reduce((sum, r) => sum + (r.score / r.total_score) * 100, 0) / filteredResults.length)
        : 0;

    const passCount = filteredResults.filter(r => (r.score / r.total_score) >= 0.5).length;
    const passRate = filteredResults.length > 0 ? Math.round((passCount / filteredResults.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-brand-900">Exam History</h2>
                <p className="text-slate-500">View your past exam results and performance trends</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-brand-50 rounded-lg">
                            <Icons.BookOpen className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Exams</p>
                            <p className="text-2xl font-bold text-brand-900">{filteredResults.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <Icons.CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Average Score</p>
                            <p className="text-2xl font-bold text-green-900">{avgScore}%</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Icons.Award className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Pass Rate</p>
                            <p className="text-2xl font-bold text-blue-900">{passRate}%</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Performance Trend Chart */}
            {trendData.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-brand-900 mb-4">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#4a7cbd" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={sortBy === 'date' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('date')}
                    >
                        <Icons.Clock className="w-4 h-4 mr-2" />
                        By Date
                    </Button>
                    <Button
                        variant={sortBy === 'score' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('score')}
                    >
                        <Icons.Award className="w-4 h-4 mr-2" />
                        By Score
                    </Button>
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                {filteredResults.map((result) => {
                    const percentage = Math.round((result.score / result.total_score) * 100);
                    const isPassed = percentage >= 50;

                    return (
                        <Card key={result.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-brand-900">{result.exam_title}</h4>
                                        <Badge variant={isPassed ? 'success' : 'danger'}>
                                            {result.grade}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Icons.BookOpen className="w-4 h-4" />
                                            {result.subject}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icons.Clock className="w-4 h-4" />
                                            {new Date(result.submitted_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold text-brand-900">{percentage}%</div>
                                    <div className="text-sm text-slate-500">
                                        {result.score} / {result.total_score}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredResults.length === 0 && (
                    <Card className="p-8 text-center">
                        <Icons.BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">No exam results found</p>
                        {filterSubject && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterSubject('')}
                                className="mt-2"
                            >
                                Clear filter
                            </Button>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};
