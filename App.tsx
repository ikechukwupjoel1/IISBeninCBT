import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_EXAMS, MOCK_RESULTS, MOCK_HALLS } from './utils/mockData';
import { User, UserRole, Exam, ExamResult } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ExamSession from './components/ExamSession';
import { Button, Label, Card, Input } from './components/ui/UI';
import { Logo } from './components/ui/Logo';
import { Particles } from './components/ui/Particles';
import { explainPerformance } from './services/geminiService';
import { Icons } from './components/ui/Icons';

const App: React.FC = () => {
  // -- Global State --
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State (Lifted up so Admin/Teacher updates reflect for Student)
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);
  const [results, setResults] = useState<any[]>(MOCK_RESULTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [halls, setHalls] = useState<string[]>(MOCK_HALLS);
  const [globalLogo, setGlobalLogo] = useState<string>(''); // Base64 string for logo
  const [completedAttempts, setCompletedAttempts] = useState<string[]>([]); // List of Exam IDs taken by current session

  // Session State
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [examResult, setExamResult] = useState<{ score: number, total: number, feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Login Form State
  const [regNo, setRegNo] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Check against all registered users
      const foundUser = users.find(u => {
        if (u.role === UserRole.ADMIN) return regNo === 'admin' && pin === 'admin';
        if (u.role === UserRole.TEACHER) return (regNo === 'staff' && pin === 'school') || (u.id === regNo && u.pin === pin); // Allow mock fallback or exact match
        return u.regNumber === regNo && u.pin === pin;
      });

      // Mock Fallbacks for Demo purposes if specific user not found in list but using demo creds
      if (foundUser) {
         setCurrentUser(foundUser);
      } else if (regNo === 'admin' && pin === 'admin') {
        setCurrentUser(users.find(u => u.role === UserRole.ADMIN) || MOCK_USERS[0]);
      } else if (regNo === 'staff' && pin === 'school') {
        setCurrentUser(users.find(u => u.role === UserRole.TEACHER) || MOCK_USERS[2]); 
      } else if (regNo === 'IIS-2024-001' && pin === '12345') {
         setCurrentUser(users.find(u => u.role === UserRole.STUDENT) || MOCK_USERS[1]);
      } else {
        setError('Invalid credentials. Try "admin/admin", "staff/school" or "IIS-2024-001/12345"');
      }
      setLoading(false);
    }, 800);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentExam(null);
    setExamResult(null);
    setRegNo('');
    setPin('');
  };

  // Handle Exam Submission
  const handleExamSubmit = async (answers: Record<string, any>) => {
    if (!currentExam || !currentUser) return;
    setLoading(true);
    const currentExamSubject = currentExam.subject;

    let score = 0;
    currentExam.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += q.points;
      }
    });

    const total = currentExam.questions.reduce((sum, q) => sum + q.points, 0);
    
    // 1. Get AI Feedback
    const feedback = await explainPerformance(score, total, currentExamSubject);

    // 2. Record Result locally
    const newResult = {
      id: `r-${Date.now()}`,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      score: score,
      totalScore: total,
      grade: calculateGrade(score, total),
      date: new Date().toISOString().split('T')[0]
    };
    setResults(prev => [newResult, ...prev]);

    // 3. Mark as completed for this session
    setCompletedAttempts(prev => [...prev, currentExam.id]);

    // 4. Update View
    setCurrentExam(null);
    setExamResult({ score, total, feedback });
    setLoading(false);
  };

  const calculateGrade = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  // -- RENDER VIEWS --

  // 1. Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 relative overflow-hidden">
        <Particles />
        
        {/* Decorative backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-brand-100/50 pointer-events-none"></div>
        
        <div className="w-full max-w-md relative z-10 px-6 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center mb-8">
            <div className="p-5 bg-white rounded-full shadow-glow mb-6 ring-8 ring-white/50">
               <Logo className="w-20 h-20" src={globalLogo} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-brand-900 text-center">Indian International School</h1>
            <p className="text-slate-500 font-medium text-sm uppercase tracking-[0.2em] mt-2">Benin &bull; CBT Platform</p>
          </div>
          
          <Card className="p-8 shadow-soft bg-white/80 backdrop-blur-lg border-white/50">
            <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">Access Portal</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
              <div>
                <Label className="text-slate-600">ID / Registration Number</Label>
                <Input 
                    className="bg-white/50 focus:bg-white transition-colors"
                    placeholder="e.g. IIS-2024-001 or admin" 
                    value={regNo}
                    onChange={(e: any) => setRegNo(e.target.value)}
                    required 
                />
              </div>
              <div>
                <Label className="text-slate-600">Access PIN / Password</Label>
                <Input 
                    type="password" 
                    className="bg-white/50 focus:bg-white transition-colors"
                    placeholder="••••••"
                    value={pin}
                    onChange={(e: any) => setPin(e.target.value)}
                    required 
                />
              </div>
              <Button className="w-full py-3.5 text-base font-bold shadow-lg shadow-brand-200/50 mt-2" disabled={loading}>
                {loading ? 'Verifying...' : 'Secure Login'}
              </Button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-6">Protected by Secure Session Layer</p>
          </Card>
        </div>
      </div>
    );
  }

  // 2. Result Screen (Post Exam)
  if (examResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
        <Particles />
        <div className="absolute inset-0 bg-brand-50/50 backdrop-blur-[2px]"></div>
        
        <Card className="max-w-lg w-full p-10 text-center shadow-xl border-0 relative z-10 bg-white animate-in zoom-in duration-500">
          <div className="mx-auto w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50 shadow-sm">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-900 mb-2">Submitted Successfully</h2>
          <p className="text-slate-500 mb-8">Your assessment has been recorded.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                 <span className="block text-xs font-bold text-slate-400 uppercase">Score</span>
                 <span className="text-2xl font-black text-brand-900">{examResult.score} / {examResult.total}</span>
             </div>
             <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                 <span className="block text-xs font-bold text-slate-400 uppercase">Percentage</span>
                 <span className="text-2xl font-black text-brand-900">{Math.round((examResult.score / examResult.total) * 100)}%</span>
             </div>
          </div>

          <div className="bg-brand-50 p-6 rounded-xl text-left mb-8 border border-brand-100">
            <div className="flex items-center gap-2 mb-2">
                <Icons.Sparkles className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-brand-600 uppercase">Performance Insight</span>
            </div>
            <p className="text-slate-700 text-sm font-medium italic leading-relaxed">"{examResult.feedback}"</p>
          </div>

          <Button onClick={() => setExamResult(null)} className="w-full py-3" variant="primary">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Roles Routing

  if (currentUser.role === UserRole.ADMIN) {
    return (
      <AdminDashboard 
        onLogout={handleLogout} 
        exams={exams}
        onUpdateExams={setExams}
        globalLogo={globalLogo}
        onUpdateLogo={setGlobalLogo}
        users={users}
        onUpdateUsers={setUsers}
        halls={halls}
        onUpdateHalls={setHalls}
      />
    );
  }

  if (currentUser.role === UserRole.TEACHER) {
    return (
      <TeacherDashboard 
        teacherName={currentUser.name} 
        onLogout={handleLogout}
        exams={exams}
        onAddExam={(newExam) => setExams(prev => [...prev, newExam])}
        results={results}
        globalLogo={globalLogo}
      />
    );
  }

  // Student Views
  if (currentExam) {
    return (
      <ExamSession 
        exam={currentExam} 
        student={currentUser} 
        onSubmit={handleExamSubmit} 
      />
    );
  }

  return (
    <StudentDashboard 
      student={currentUser} 
      exams={exams}
      results={results}
      completedExamIds={completedAttempts}
      onStartExam={(exam) => setCurrentExam(exam)} 
      onLogout={handleLogout} 
      globalLogo={globalLogo}
    />
  );
};

export default App;