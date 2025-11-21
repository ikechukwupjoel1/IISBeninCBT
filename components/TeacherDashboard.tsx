import React, { useState } from 'react';
import { Button, Card, Input, Label, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { generateQuestions } from '../services/geminiService';
import { Question, Exam, ExamStatus, QuestionType } from '../types';

interface TeacherDashboardProps {
  onLogout: () => void;
  teacherName: string;
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  results: any[];
  globalLogo: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout, teacherName, exams, onAddExam, results, globalLogo }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'bank' | 'results'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  
  // Create Exam Form
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  
  // Bulk Upload State
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

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
    // Simple parser: "Question | Option1,Option2,Option3,Option4 | CorrectAnswer"
    const lines = bulkText.split('\n');
    const newQuestions: Question[] = [];
    
    lines.forEach((line, idx) => {
        const parts = line.split('|');
        if (parts.length >= 3) {
            const text = parts[0].trim();
            const options = parts[1].split(',').map(o => o.trim());
            const correct = parts[2].trim();
            
            if (text && options.length > 0 && correct) {
                newQuestions.push({
                    id: `bulk-${Date.now()}-${idx}`,
                    text,
                    type: QuestionType.MULTIPLE_CHOICE,
                    options,
                    correctAnswer: correct,
                    points: 2
                });
            }
        }
    });

    if (newQuestions.length > 0) {
        setGeneratedQuestions(prev => [...prev, ...newQuestions]);
        setBulkText('');
        setShowBulkModal(false);
        alert(`Successfully imported ${newQuestions.length} questions.`);
    } else {
        alert("Could not parse questions. Use format: Question | Op1,Op2,Op3,Op4 | CorrectAnswer");
    }
  };

  const handlePublishExam = () => {
      if (!title || !subject || generatedQuestions.length === 0) {
          alert("Please fill in title, subject and add at least one question.");
          return;
      }

      const newExam: Exam = {
          id: `exam-${Date.now()}`,
          title,
          subject,
          durationMinutes: 30, // Default
          totalQuestions: generatedQuestions.length,
          questions: generatedQuestions,
          status: ExamStatus.ACTIVE,
          assignedClass: 'General'
      };

      onAddExam(newExam);
      alert("Exam Published Successfully!");
      
      // Reset
      setTitle('');
      setSubject('');
      setAiTopic('');
      setGeneratedQuestions([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
           <Logo className="w-10 h-10" src={globalLogo} />
           <span className="font-serif font-bold text-brand-900">Staff Portal</span>
        </div>
        <nav className="p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</div>
            <button 
                onClick={() => setActiveTab('create')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'create' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Icons.Plus className="w-4 h-4" /> Create Exam
            </button>
            <button 
                onClick={() => setActiveTab('bank')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'bank' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Icons.BookOpen className="w-4 h-4" /> My Question Bank
            </button>
            <button 
                onClick={() => setActiveTab('results')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'results' ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'}`}
            >
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
          
          {activeTab === 'create' && (
            <div className="max-w-4xl mx-auto animate-in fade-in">
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
                            <Input 
                                placeholder="e.g. Term 2 Final Assessment" 
                                value={title}
                                onChange={(e:any) => setTitle(e.target.value)}
                            />
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

                    {generatedQuestions.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h3 className="font-bold text-slate-800">Question Queue ({generatedQuestions.length})</h3>
                            {generatedQuestions.map((q, i) => (
                                <div key={i} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="flex justify-between">
                                        <p className="font-medium text-slate-800 mb-2">{i+1}. {q.text}</p>
                                        <button className="text-red-500 text-xs font-bold" onClick={() => setGeneratedQuestions(prev => prev.filter((_, idx) => idx !== i))}>REMOVE</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 ml-4">
                                        {q.options?.map(opt => (
                                            <span key={opt} className={opt === q.correctAnswer ? 'text-green-600 font-bold' : ''}>• {opt}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setGeneratedQuestions([])}>Clear All</Button>
                                <Button onClick={handlePublishExam} variant="primary">Publish Exam</Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
          )}

          {activeTab === 'bank' && (
             <div className="animate-in fade-in">
                <h1 className="text-2xl font-serif font-bold text-brand-900 mb-6">Question Bank</h1>
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
                <h1 className="text-2xl font-serif font-bold text-brand-900 mb-6">Past Results</h1>
                <Card className="overflow-hidden">
                    <table className="w-full text-left">
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
                </Card>
             </div>
          )}
      </main>

      {/* Bulk Import Modal */}
      {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
             <Card className="w-full max-w-2xl p-6 animate-in zoom-in duration-200">
                <h3 className="font-bold text-lg mb-2">Bulk Import Questions</h3>
                <p className="text-sm text-slate-500 mb-4">Format: <span className="font-mono bg-slate-100 px-1 rounded">Question Text | Option1, Option2, Option3, Option4 | CorrectOption</span></p>
                <textarea 
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder={`What is 2+2? | 3, 4, 5, 6 | 4\nCapital of France? | London, Berlin, Paris, Madrid | Paris`}
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
    </div>
  );
};

export default TeacherDashboard;