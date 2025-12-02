import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Label } from './ui/UI';
import { Icons } from './ui/Icons';
import { reportingService, StudentProgress } from '../services/reportingService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { databaseService } from '../services/databaseService';

interface TeacherReportsProps {
    teacherId: string;
}

export const TeacherReports: React.FC<TeacherReportsProps> = ({ teacherId }) => {
    const [activeTab, setActiveTab] = useState<'students' | 'questions'>('students');
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentProgress(selectedStudent);
        }
    }, [selectedStudent]);

    const loadStudents = async () => {
        try {
            // In a real app, we'd filter by classes assigned to the teacher
            const { data } = await databaseService.getAllUsers();
            const studentList = data?.filter((u: any) => u.role === 'STUDENT') || [];
            setStudents(studentList);
            if (studentList.length > 0) {
                setSelectedStudent(studentList[0].id);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const loadStudentProgress = async (studentId: string) => {
        setLoading(true);
        try {
            const progress = await reportingService.getStudentProgress(studentId);
            setStudentProgress(progress);
        } catch (error) {
            console.error('Error loading student progress:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-brand-900">Class Analytics</h2>
                    <p className="text-slate-500">Track student progress and question performance</p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Student Progress
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Question Analysis
                    </button>
                </div>
            </div>

            {activeTab === 'students' && (
                <div className="space-y-6">
                    {/* Student Selector */}
                    <Card className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/3">
                                <Label>Select Student</Label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} ({student.reg_number})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-2/3 flex justify-end">
                                <div className="flex gap-4 text-sm">
                                    <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                        <span className="text-slate-500 block text-xs uppercase font-bold">Exams Taken</span>
                                        <span className="text-xl font-bold text-blue-700">{studentProgress.length}</span>
                                    </div>
                                    <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                                        <span className="text-slate-500 block text-xs uppercase font-bold">Avg Score</span>
                                        <span className="text-xl font-bold text-green-700">
                                            {studentProgress.length > 0
                                                ? Math.round(studentProgress.reduce((a, b) => a + b.percentage, 0) / studentProgress.length)
                                                : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Progress Chart */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-brand-900 mb-4">Performance Trend</h3>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Icons.Spinner className="w-8 h-8 animate-spin text-brand-600" />
                            </div>
                        ) : studentProgress.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={studentProgress}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="examTitle" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="percentage" name="Score %" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <Icons.BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No exam data available for this student</p>
                            </div>
                        )}
                    </Card>

                    {/* Exam History Table */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-brand-900 mb-4">Detailed Exam History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                                        <th className="text-left p-3 font-semibold text-slate-700">Exam Title</th>
                                        <th className="text-left p-3 font-semibold text-slate-700">Subject</th>
                                        <th className="text-left p-3 font-semibold text-slate-700">Score</th>
                                        <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentProgress.map((exam, index) => (
                                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="p-3 text-slate-500">{new Date(exam.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-3 font-medium">{exam.examTitle}</td>
                                            <td className="p-3">{exam.subject}</td>
                                            <td className="p-3">
                                                <span className="font-bold">{exam.score}</span> / {exam.totalScore} ({exam.percentage}%)
                                            </td>
                                            <td className="p-3">
                                                <Badge variant={exam.percentage >= 50 ? 'success' : 'danger'}>
                                                    {exam.percentage >= 50 ? 'Passed' : 'Failed'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'questions' && (
                <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icons.Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-900 mb-2">Coming Soon</h3>
                        <p className="text-slate-500">
                            Detailed question analysis and difficulty metrics will be available in the next update.
                            This will help identify topics where students are struggling.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};
