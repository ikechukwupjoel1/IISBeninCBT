import React, { useState } from 'react';
import { Button, Card, Input, Label } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { generateQuestions } from '../services/geminiService';
import { Question } from '../types';

interface TeacherDashboardProps {
  onLogout: () => void;
  teacherName: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, teacherName }) => {
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [subject, setSubject] = useState('');

  const handleGenerateQuestions = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    try {
      const questions = await generateQuestions(aiTopic, 5, 'Medium');
      setGeneratedQuestions(questions);
    } catch (e) {
      alert("Failed to generate questions. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <Logo className="w-10 h-10" />
           <span className="font-serif font-bold text-brand-900">Staff Portal</span>
        </div>
        <nav className="p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-brand-50 text-brand-800 font-medium">
                <Icons.Plus className="w-4 h-4" /> Create Exam
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                <Icons.BookOpen className="w-4 h-4" /> My Question Bank
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
                <Icons.Dashboard className="w-4 h-4" /> Past Results
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
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-serif font-bold text-brand-900 mb-2">Upload Assessment</h1>
            <p className="text-slate-500 mb-8">Create a new Computer Based Test using AI assistance or manual upload.</p>

            <Card className="p-8 border-0 shadow-soft bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <Label>Subject</Label>
                        <Input 
                          placeholder="e.g. Mathematics" 
                          value={subject}
                          onChange={(e:any) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                         <Label>Exam Title</Label>
                         <Input placeholder="e.g. Term 2 Final Assessment" />
                    </div>
                </div>

                <div className="bg-brand-50 p-6 rounded-2xl border border-brand-100">
                    <div className="flex items-center gap-2 mb-4 text-brand-800">
                        <Icons.Sparkles className="w-5 h-5" />
                        <h3 className="font-bold">AI Question Generator</h3>
                    </div>
                    <Label>Topic / Context</Label>
                    <textarea 
                        className="w-full mt-2 p-4 rounded-xl border-slate-200 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                        rows={3}
                        placeholder="Describe what the test should cover (e.g., 'Calculus derivatives and integrals for Grade 12')..."
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleGenerateQuestions} disabled={isGenerating || !aiTopic}>
                            {isGenerating ? 'Generating...' : 'Generate Questions'}
                        </Button>
                    </div>
                </div>

                {generatedQuestions.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h3 className="font-bold text-slate-800">Preview Questions ({generatedQuestions.length})</h3>
                        {generatedQuestions.map((q, i) => (
                            <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                <p className="font-medium text-slate-800 mb-2">{i+1}. {q.text}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 ml-4">
                                    {q.options?.map(opt => (
                                        <span key={opt} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>• {opt}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setGeneratedQuestions([])}>Clear</Button>
                            <Button onClick={() => {
                                alert("Exam Uploaded Successfully!");
                                setGeneratedQuestions([]);
                                setAiTopic('');
                                setSubject('');
                            }}>Publish Exam</Button>
                        </div>
                    </div>
                )}
            </Card>
          </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;