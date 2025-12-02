
import React, { useState } from 'react';
import { Button, Card, Input, Label, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { ImageUpload } from './ui/ImageUpload';
import { generateQuestions } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { Question, Exam, ExamStatus, QuestionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_STATS } from '../utils/mockData';

interface TeacherDashboardProps {
    onLogout: () => void;
    teacherName: string;
    teacherId: string;
    exams: Exam[];
    onRefreshData: () => Promise<void>;
    results: any[];
    globalLogo: string;
}

const SCHOOL_CLASSES = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, teacherName, teacherId, exams, onRefreshData, results, globalLogo }) => {
    const [activeTab, setActiveTab] = useState<'create' | 'bank' | 'results' | 'analytics'>('create');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

    // Create Exam Form
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [assignedClass, setAssignedClass] = useState('');
    const [aiTopic, setAiTopic] = useState('');

    // Bulk Upload State
    const [bulkText, setBulkText] = useState('');
    const [showBulkModal, setShowBulkModal] = useState(false);

    // Edit Question State
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editForm, setEditForm] = useState({ text: '', correctAnswer: '', options: ['', '', '', ''] });

    // Manual Question State
    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
        text: '',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
        imageUrl: '',
        optionImages: ['', '', '', ''],
        matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }]
    });

    // Marking State
    const [markingResult, setMarkingResult] = useState<any | null>(null);
    const [markingExam, setMarkingExam] = useState<Exam | null>(null);
    const [marks, setMarks] = useState<Record<string, number>>({});
    const [showMarkingModal, setShowMarkingModal] = useState(false);

    const handleGenerateQuestions = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        try {
            const questions = await generateQuestions(aiTopic, 5, 'Medium');
            setGeneratedQuestions(prev => [...prev, ...questions]);
        } catch (e) {
            alert("Failed to generate questions. Check API Key.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBulkParse = () => {
        // Supports two formats:
        // 1. Pipe: Question | Op1, Op2, Op3, Op4 | Correct
        // 2. CSV: Question, Op1, Op2, Op3, Op4, Correct

        const lines = bulkText.split('\n').filter(line => line.trim() !== '');
        const newQuestions: Question[] = [];
        let successCount = 0;
        let failCount = 0;

        lines.forEach((line, idx) => {
            let parts: string[] = [];

            // Detect format
            if (line.includes('|')) {
                // Pipe format
                const segments = line.split('|');
                if (segments.length >= 3) {
                    const qText = segments[0].trim();
                    const optionsPart = segments[1].split(',').map(o => o.trim());
                    const correct = segments[2].trim();
                    parts = [qText, ...optionsPart, correct];
                }
            } else {
                // CSV format (simple split by comma, respecting quotes would be better but simple for now)
                // For a robust CSV parser we'd need a library or complex regex, but let's try a simple split first
                // assuming no commas in text for this simple version.
                parts = line.split(',').map(p => p.trim());
            }

            // Validate parts
            // We expect: Question + at least 2 options + Answer
            if (parts.length >= 4) {
                const text = parts[0];
                const correctAnswer = parts[parts.length - 1];
                const options = parts.slice(1, parts.length - 1);

                if (text && options.length >= 2 && correctAnswer) {
                    newQuestions.push({
                        id: `bulk-${Date.now()}-${idx}`,
                        text,
                        type: QuestionType.MULTIPLE_CHOICE,
                        options,
                        correctAnswer,
                        points: 2
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            } else {
                failCount++;
            }
        });

        if (newQuestions.length > 0) {
            setGeneratedQuestions(prev => [...prev, ...newQuestions]);
            setBulkText('');
            setShowBulkModal(false);
            alert(`Successfully imported ${successCount} questions.${failCount > 0 ? ` Failed to parse ${failCount} lines.` : ''}`);
        } else {
            alert("Could not parse questions. Please check the format.\n\nCSV Example:\nQuestion, Option1, Option2, Option3, Option4, CorrectAnswer");
        }
    };

    const openEditModal = (q: Question) => {
        setEditingQuestion(q);
        setEditForm({
            text: q.text,
            correctAnswer: String(q.correctAnswer),
            options: q.options || ['', '', '', '']
        });
    };

    const saveEditedQuestion = () => {
        if (!editingQuestion) return;

        setGeneratedQuestions(prev => prev.map(q => q.id === editingQuestion.id ? {
            ...q,
            text: editForm.text,
            options: editForm.options,
            correctAnswer: editForm.correctAnswer
        } : q));
        setEditingQuestion(null);
    };

    const handleOpenMarking = async (result: any) => {
        setMarkingResult(result);
        try {
            const { data: exam } = await databaseService.getExamById(result.exam_id);
            if (exam) {
                setMarkingExam(exam);
                // Initialize marks from existing score or default to 0 (or try to parse if we stored per-question marks)
                // For now, we'll start fresh or maybe we can infer? 
                // Let's just initialize with 0 for now, or maybe we can't easily know previous per-question marks unless we stored them.
                // If we want to support re-marking, we'd need to store the breakdown. 
                // For this MVP, we'll assume manual marking starts from scratch or we just let them enter.
                setMarks({});
                setShowMarkingModal(true);
            }
        } catch (error) {
            console.error("Failed to load exam details for marking", error);
        }
    };

    const handleCalculateTotal = (): number => {
        const total = (Object.values(marks) as number[]).reduce((sum, mark) => sum + mark, 0);
        return total;
    };

    const handleSaveMarks = async () => {
        if (!markingResult) return;
        const totalScore = handleCalculateTotal();

        // Determine grade (simple logic for now, can be expanded)
        let grade = 'F';
        const percentage = (totalScore / (Number(markingResult.total_score) || 100)) * 100; // Use exam total if available
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        try {
            await databaseService.updateResult(String(markingResult.id), {
                score: totalScore,
                grade: grade,
                // We could store the marks breakdown in 'answers' or a new field if we wanted to persist it
                // For now, just updating the total score is the requirement.
            });
            onRefreshData();
            setShowMarkingModal(false);
            setMarkingResult(null);
            setMarkingExam(null);
        } catch (error) {
            console.error("Failed to save marks", error);
        }
    };

    const handlePublishExam = async () => {
        if (!title || !subject || !assignedClass || generatedQuestions.length === 0) {
            alert("Please fill in title, subject, target class and add at least one question.");
            return;
        }

        setIsPublishing(true);
        try {
            const examData: Partial<Exam> = {
                title,
                subject,
                durationMinutes: 30, // Default
                questions: generatedQuestions,
                status: ExamStatus.ACTIVE,
                assignedClass: assignedClass
            };

            const { data, error } = await databaseService.createExam(examData, teacherId);

            if (error) {
                alert(`Failed to publish exam: ${error}`);
                return;
            }

            alert("Exam Published Successfully!");

            // Reset form
            setTitle('');
            setSubject('');
            setAssignedClass('');
            setAiTopic('');
            setGeneratedQuestions([]);

            // Refresh data from database
            await onRefreshData();
        } catch (err: any) {
            alert(`Error publishing exam: ${err.message}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo className="w-10 h-10" src={globalLogo} />
                        <span className="font-serif font-bold text-brand-900">Staff Portal</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
                        <Icons.X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-4 space-y-2 overflow-y-auto">
                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</div>
                    <button
                        onClick={() => { setActiveTab('create'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'create' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Icons.Plus className="w-4 h-4" /> Create Exam
                    </button>
                    <button
                        onClick={() => { setActiveTab('bank'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'bank' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Icons.BookOpen className="w-4 h-4" /> My Question Bank
                    </button>
                    <button
                        onClick={() => { setActiveTab('results'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'results' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Icons.Dashboard className="w-4 h-4" /> Past Results
                    </button>
                    <button
                        onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'analytics' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Icons.Sparkles className="w-4 h-4" /> Analytics
                    </button>
                </nav>
                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {teacherName.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{teacherName}</p>
                            <p className="text-xs text-slate-500">Teacher</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full py-2 text-xs font-bold text-red-500 bg-red-50 rounded hover:bg-red-100">Sign Out</button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">

                {activeTab === 'create' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in">
                        <div className="flex items-center gap-3 mb-2">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-brand-900">
                                <Icons.Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-serif font-bold text-brand-900">Upload Assessment</h1>
                        </div>
                        <p className="text-slate-500 mb-8">Create a new Computer Based Test using AI assistance or manual upload.</p>

                        <Card className="p-8 border-0 shadow-soft bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <Label>Subject</Label>
                                    <Input
                                        placeholder="e.g. Mathematics"
                                        value={subject}
                                        onChange={(e: any) => setSubject(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Exam Title</Label>
                                    <Input
                                        placeholder="e.g. Term 2 Final Assessment"
                                        value={title}
                                        onChange={(e: any) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Target Class</Label>
                                    <select
                                        className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border mt-1"
                                        value={assignedClass}
                                        onChange={(e) => setAssignedClass(e.target.value)}
                                    >
                                        <option value="">Select Class...</option>
                                        {SCHOOL_CLASSES.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* AI Section */}
                                <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
                                    <div className="flex items-center gap-2 mb-4 text-brand-800">
                                        <Icons.Sparkles className="w-5 h-5" />
                                        <h3 className="font-bold">AI Question Generator</h3>
                                    </div>
                                    <Label>Topic / Context</Label>
                                    <textarea
                                        className="w-full mt-2 p-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                                        rows={3}
                                        placeholder="Describe what the test should cover..."
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={handleGenerateQuestions} disabled={isGenerating || !aiTopic}>
                                            {isGenerating ? 'Generating...' : 'Generate Questions'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Manual/Bulk Section */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center text-center">
                                    <div className="bg-white p-3 rounded-full shadow-sm mb-4 text-slate-600">
                                        <Icons.BookOpen className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Bulk Upload</h3>
                                    <p className="text-xs text-slate-500 mb-6 px-4">Import questions from CSV or formatted text (Pipe separated).</p>
                                    <Button variant="secondary" onClick={() => setShowBulkModal(true)}>Open Bulk Importer</Button>
                                </div>
                            </div>

                            {/* Manual Entry Section */}
                            <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-6 text-brand-800">
                                    <Icons.Plus className="w-5 h-5" />
                                    <h3 className="font-bold">Manual Entry</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label>Question Type</Label>
                                            <select
                                                className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                                                value={newQuestion.type}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as QuestionType, correctAnswer: e.target.value === QuestionType.MULTI_SELECT ? [] : '' })}
                                            >
                                                <option value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice (Single)</option>
                                                <option value={QuestionType.MULTI_SELECT}>Multiple Choice (Multi-Select)</option>
                                                <option value={QuestionType.TRUE_FALSE}>True / False</option>
                                                <option value={QuestionType.MATCHING}>Matching Pairs</option>
                                                <option value={QuestionType.FILL_IN_THE_BLANK}>Fill in the Blank</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label>Points</Label>
                                            <Input
                                                type="number"
                                                value={newQuestion.points}
                                                onChange={(e: any) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Question Text</Label>
                                        <textarea
                                            className="w-full rounded-lg border-slate-300 bg-white text-slate-900 sm:text-sm py-3 px-4 border"
                                            rows={3}
                                            value={newQuestion.text}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                            placeholder="Enter the question here..."
                                        />
                                        <div className="mt-3">
                                            <ImageUpload
                                                label="Question Image (Optional)"
                                                folder="questions"
                                                currentImageUrl={newQuestion.imageUrl}
                                                onUploadComplete={(url) => setNewQuestion({ ...newQuestion, imageUrl: url })}
                                            />
                                        </div>
                                    </div>

                                    {/* Options Logic */}
                                    {(newQuestion.type === QuestionType.MULTIPLE_CHOICE || newQuestion.type === QuestionType.MULTI_SELECT) && (
                                        <div className="space-y-3">
                                            <Label>Answer Options</Label>
                                            {newQuestion.options?.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            placeholder={`Option ${idx + 1}`}
                                                            value={opt}
                                                            onChange={(e: any) => {
                                                                const newOpts = [...(newQuestion.options || [])];
                                                                newOpts[idx] = e.target.value;
                                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                                            }}
                                                        />
                                                        <ImageUpload
                                                            label={`Option ${idx + 1} Image (Optional)`}
                                                            folder="options"
                                                            currentImageUrl={newQuestion.optionImages?.[idx]}
                                                            onUploadComplete={(url) => {
                                                                const newImgs = [...(newQuestion.optionImages || ['', '', '', ''])];
                                                                newImgs[idx] = url;
                                                                setNewQuestion({ ...newQuestion, optionImages: newImgs });
                                                            }}
                                                        />
                                                    </div>

                                                    {newQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            className="mt-3 w-5 h-5 text-brand-600 focus:ring-brand-500"
                                                            checked={newQuestion.correctAnswer === opt && opt !== ''}
                                                            onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="checkbox"
                                                            className="mt-3 w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                                                            checked={Array.isArray(newQuestion.correctAnswer) && newQuestion.correctAnswer.includes(opt)}
                                                            onChange={(e) => {
                                                                let current = Array.isArray(newQuestion.correctAnswer) ? [...newQuestion.correctAnswer] : [];
                                                                if (e.target.checked) {
                                                                    current.push(opt);
                                                                } else {
                                                                    current = current.filter(c => c !== opt);
                                                                }
                                                                setNewQuestion({ ...newQuestion, correctAnswer: current });
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {newQuestion.type === QuestionType.TRUE_FALSE && (
                                        <div>
                                            <Label>Correct Answer</Label>
                                            <div className="flex gap-4 mt-2">
                                                {['True', 'False'].map(opt => (
                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="correctAnswer"
                                                            className="w-4 h-4 text-brand-600"
                                                            checked={newQuestion.correctAnswer === opt}
                                                            onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: opt })}
                                                        />
                                                        <span className="text-sm font-medium">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {newQuestion.type === QuestionType.MATCHING && (
                                        <div className="space-y-3">
                                            <Label>Matching Pairs (Left - Right)</Label>
                                            {newQuestion.matchingPairs?.map((pair, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        placeholder="Left Item (e.g. Country)"
                                                        value={pair.left}
                                                        onChange={(e: any) => {
                                                            const newPairs = [...(newQuestion.matchingPairs || [])];
                                                            newPairs[idx].left = e.target.value;
                                                            setNewQuestion({ ...newQuestion, matchingPairs: newPairs });
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Right Item (e.g. Capital)"
                                                        value={pair.right}
                                                        onChange={(e: any) => {
                                                            const newPairs = [...(newQuestion.matchingPairs || [])];
                                                            newPairs[idx].right = e.target.value;
                                                            setNewQuestion({ ...newQuestion, matchingPairs: newPairs });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setNewQuestion({
                                                    ...newQuestion,
                                                    matchingPairs: [...(newQuestion.matchingPairs || []), { left: '', right: '' }]
                                                })}
                                            >
                                                + Add Pair
                                            </Button>
                                        </div>
                                    )}

                                    {newQuestion.type === QuestionType.FILL_IN_THE_BLANK && (
                                        <div>
                                            <Label>Correct Answer</Label>
                                            <Input
                                                placeholder="Type the exact answer..."
                                                value={newQuestion.correctAnswer as string}
                                                onChange={(e: any) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => {
                                                if (!newQuestion.text || !newQuestion.correctAnswer) {
                                                    alert("Please fill in the question and correct answer.");
                                                    return;
                                                }
                                                setGeneratedQuestions(prev => [...prev, {
                                                    ...newQuestion,
                                                    id: `manual-${Date.now()}`,
                                                    type: newQuestion.type as QuestionType,
                                                    options: newQuestion.options || [],
                                                    correctAnswer: newQuestion.correctAnswer as any,
                                                    points: newQuestion.points || 1
                                                } as Question]);
                                                setNewQuestion({
                                                    text: '',
                                                    type: QuestionType.MULTIPLE_CHOICE,
                                                    options: ['', '', '', ''],
                                                    correctAnswer: '',
                                                    points: 1,
                                                    imageUrl: '',
                                                    optionImages: ['', '', '', ''],
                                                    matchingPairs: [{ left: '', right: '' }, { left: '', right: '' }]
                                                });
                                            }}
                                        >
                                            Add Question
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {generatedQuestions.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <h3 className="font-bold text-slate-800">Question Queue ({generatedQuestions.length})</h3>
                                    {generatedQuestions.map((q, i) => (
                                        <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 group">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-slate-800 mb-2 flex-1">{i + 1}. {q.text}</p>
                                                <div className="flex gap-2">
                                                    <button className="text-brand-600 text-xs font-bold hover:underline" onClick={() => openEditModal(q)}>EDIT</button>
                                                    <button className="text-red-500 text-xs font-bold hover:underline" onClick={() => setGeneratedQuestions(prev => prev.filter((_, idx) => idx !== i))}>REMOVE</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 ml-4">
                                                {q.options?.map(opt => (
                                                    <span key={opt} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>• {opt}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                        <Button variant="secondary" onClick={() => setGeneratedQuestions([])} disabled={isPublishing}>Clear All</Button>
                                        <Button onClick={handlePublishExam} variant="primary" disabled={isPublishing}>
                                            {isPublishing ? 'Publishing...' : 'Publish Exam'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="animate-in fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-brand-900">
                                <Icons.Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-serif font-bold text-brand-900">Question Bank</h1>
                        </div>
                        <div className="grid gap-6">
                            {exams.map(exam => (
                                <Card key={exam.id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{exam.title}</h3>
                                            <Badge>{exam.subject}</Badge>
                                        </div>
                                        <span className="text-sm text-slate-500">{exam.questions.length} Questions</span>
                                    </div>
                                    <div className="space-y-2">
                                        {exam.questions.slice(0, 3).map((q, i) => (
                                            <p key={i} className="text-sm text-slate-600 truncate">• {q.text}</p>
                                        ))}
                                        {exam.questions.length > 3 && <p className="text-xs text-slate-400 italic">...and {exam.questions.length - 3} more</p>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div className="animate-in fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-brand-900">
                                <Icons.Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-serif font-bold text-brand-900">Past Results</h1>
                        </div>
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Exam</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {results.map((res: any) => (
                                            <tr key={res.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm">{res.date}</td>
                                                <td className="px-6 py-4 font-medium">{res.examTitle}</td>
                                                <td className="px-6 py-4 text-sm">{res.score} / {res.totalScore}</td>
                                                <td className="px-6 py-4"><Badge color={res.grade.startsWith('A') ? 'green' : res.grade === 'F' ? 'red' : 'blue'}>{res.grade}</Badge></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="animate-in fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-brand-900">
                                <Icons.Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-serif font-bold text-brand-900">Performance Analytics</h1>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h3 className="font-bold text-lg mb-4">Pass vs Fail Rates</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={MOCK_STATS}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="pass" fill="#10b981" name="Pass %" />
                                            <Bar dataKey="fail" fill="#ef4444" name="Fail %" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h3 className="font-bold text-lg mb-4">Grade Distribution (Overall)</h3>
                                <div className="h-80 w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Grade A', value: 35 },
                                                    { name: 'Grade B', value: 40 },
                                                    { name: 'Grade C', value: 15 },
                                                    { name: 'Fail', value: 10 },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#10b981" />
                                                <Cell fill="#3b82f6" />
                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#ef4444" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

            {/* Bulk Import Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl p-6 animate-in zoom-in duration-200">
                        <h3 className="font-bold text-lg mb-2">Bulk Import Questions</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Paste questions in <strong>CSV</strong> or <strong>Pipe</strong> format.<br />
                            <code className="bg-slate-100 px-1 rounded text-xs">Question, Option1, Option2, Option3, Option4, CorrectAnswer</code>
                        </p>
                        <textarea
                            className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder={`What is 2+2?, 3, 4, 5, 6, 4\nCapital of France?, London, Berlin, Paris, Madrid, Paris`}
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>Cancel</Button>
                            <Button onClick={handleBulkParse}>Import Questions</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit Question Modal */}
            {editingQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg p-6 animate-in zoom-in duration-200">
                        <h3 className="font-bold text-lg mb-4">Edit Question</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Question Text</Label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-lg"
                                    rows={2}
                                    value={editForm.text}
                                    onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {editForm.options.map((opt, idx) => (
                                    <div key={idx}>
                                        <Label>Option {idx + 1}</Label>
                                        <Input
                                            value={opt}
                                            onChange={(e: any) => {
                                                const newOpts = [...editForm.options];
                                                newOpts[idx] = e.target.value;
                                                setEditForm({ ...editForm, options: newOpts });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <Label>Correct Answer</Label>
                                <select
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                                    value={editForm.correctAnswer}
                                    onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                                >
                                    {editForm.options.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setEditingQuestion(null)}>Cancel</Button>
                            <Button onClick={saveEditedQuestion}>Save Changes</Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* Marking Modal */}
            {showMarkingModal && markingExam && markingResult && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-brand-900">Marking: {markingResult.studentName || markingResult.student_id}</h3>
                                <p className="text-slate-500">{markingExam.title}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-slate-500">Total Score</p>
                                    <p className="text-2xl font-bold text-brand-600">{handleCalculateTotal()} / {markingExam.questions.reduce((sum, q) => sum + q.points, 0)}</p>
                                </div>
                                <Button onClick={handleSaveMarks}>Save & Close</Button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {markingExam.questions.map((question, index) => {
                                const studentAnswer = markingResult.answers ? markingResult.answers[question.id] : 'No answer';
                                return (
                                    <div key={question.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 mb-2">Q{index + 1}: {question.text}</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                                                        <span className="block text-xs text-slate-400 uppercase mb-1">Student Answer</span>
                                                        <span className="font-medium text-slate-700">
                                                            {Array.isArray(studentAnswer) ? studentAnswer.join(', ') : String(studentAnswer)}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                                                        <span className="block text-xs text-green-600 uppercase mb-1">Correct Answer</span>
                                                        <span className="font-medium text-green-800">
                                                            {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : String(question.correctAnswer)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 w-32">
                                                <Label>Marks (Max: {question.points})</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={question.points}
                                                    value={marks[question.id] || 0}
                                                    onChange={(e) => setMarks({
                                                        ...marks,
                                                        [question.id]: Number(e.target.value)
                                                    })}
                                                    className="text-right font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button variant="ghost" onClick={() => setShowMarkingModal(false)}>Cancel</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
