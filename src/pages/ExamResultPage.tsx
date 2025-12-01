import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui/UI';
import { Icons } from '../components/ui/Icons';
import { Particles } from '../components/ui/Particles';
import { useToast } from '../context/ToastContext';

export const ExamResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result } = location.state || {};

    if (!result) {
        navigate('/student');
        return null;
    }

    return (
        <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <Particles />
            <main id="main-content" className="max-w-lg w-full relative z-10">
                <Card className="p-8 text-center animate-in zoom-in duration-300 shadow-2xl border-t-4 border-brand-600">
                    <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.CheckCircle className="w-10 h-10 text-brand-600" aria-hidden="true" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-brand-900 mb-2">Submission Successful</h2>
                    <p className="text-slate-500 mb-8">Your responses for <span className="font-bold text-brand-700">{result.subject}</span> have been recorded.</p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100" role="region" aria-label="Exam results">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Your Performance</p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-5xl font-black text-brand-900">{result.score}</span>
                            <span className="text-xl text-slate-400 font-medium">/ {result.total}</span>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                            <span className="text-xs font-bold text-slate-500 uppercase">Grade Achieved:</span>
                            <span className={`text-lg font-bold ${result.grade.startsWith('A') ? 'text-green-600' : 'text-brand-600'}`}>{result.grade}</span>
                        </div>
                    </div>

                    <div className="mb-6 text-left bg-blue-50 p-4 rounded-xl border border-blue-100" role="region" aria-label="AI feedback">
                        <p className="text-xs font-bold text-blue-400 uppercase mb-1">AI Feedback</p>
                        <p className="text-sm text-blue-800 italic">"{result.feedback}"</p>
                    </div>

                    {result.questions && result.answers && (
                        <div className="mb-6 text-left max-h-96 overflow-y-auto">
                            <p className="text-sm font-bold text-slate-600 uppercase mb-3 sticky top-0 bg-white py-2">Answer Review</p>
                            {result.questions.map((q: any, idx: number) => {
                                const userAnswer = result.answers![q.id];
                                const isCorrect = userAnswer === q.correctAnswer;
                                return (
                                    <div key={q.id} className={`mb-4 p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {idx + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800 mb-2">{q.text}</p>
                                                <div className="space-y-1 text-xs">
                                                    <p className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                        <span className="font-bold">Your answer:</span> {userAnswer?.toString() || 'Not answered'}
                                                    </p>
                                                    {!isCorrect && (
                                                        <p className="text-green-700">
                                                            <span className="font-bold">Correct answer:</span> {q.correctAnswer?.toString()}
                                                        </p>
                                                    )}
                                                    {q.explanation && (
                                                        <p className="text-slate-600 mt-2 italic">
                                                            💡 {q.explanation}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {isCorrect ? (
                                                <Icons.CheckCircle className="w-5 h-5 text-green-500 shrink-0" aria-label="Correct" />
                                            ) : (
                                                <Icons.ExclamationTriangle className="w-5 h-5 text-red-500 shrink-0" aria-label="Incorrect" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <Button onClick={() => navigate('/student')} className="w-full py-3">
                        Return to Dashboard
                    </Button>
                </Card>
            </main>
        </div>
    );
};
