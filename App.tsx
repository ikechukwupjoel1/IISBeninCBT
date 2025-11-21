import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_EXAMS, MOCK_RESULTS, MOCK_HALLS, MOCK_INVIGILATORS } from './utils/mockData';
import { User, UserRole, Exam, ExamResult, InvigilatorAssignment } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ExamSession from './components/ExamSession';
import { Button, Label, Card, Input, Badge } from './components/ui/UI';
import { Logo } from './components/ui/Logo';
import { Particles } from './components/ui/Particles';
import { explainPerformance } from './services/geminiService';
import { Icons } from './components/ui/Icons';

const App: React.FC = () => {
  // -- PERSISTENT STATE HELPERS --
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return fallback;
    }
  };

  // -- GLOBAL STATE --
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data State (Initialized from LocalStorage or Mock Data)
  const [exams, setExams] = useState<Exam[]>(() => loadState('iis_exams', MOCK_EXAMS));
  const [results, setResults] = useState<any[]>(() => loadState('iis_results', MOCK_RESULTS));
  const [users, setUsers] = useState<User[]>(() => loadState('iis_users', MOCK_USERS));
  const [halls, setHalls] = useState<string[]>(() => loadState('iis_halls', MOCK_HALLS));
  const [invigilators, setInvigilators] = useState<InvigilatorAssignment[]>(() => loadState('iis_invigilators', MOCK_INVIGILATORS));
  const [globalLogo, setGlobalLogo] = useState<string>(() => loadState('iis_logo', '')); 
  const [completedAttempts, setCompletedAttempts] = useState<string[]>(() => loadState('iis_completed', []));

  // -- PERSISTENCE EFFECTS --
  useEffect(() => localStorage.setItem('iis_exams', JSON.stringify(exams)), [exams]);
  useEffect(() => localStorage.setItem('iis_results', JSON.stringify(results)), [results]);
  useEffect(() => localStorage.setItem('iis_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('iis_halls', JSON.stringify(halls)), [halls]);
  useEffect(() => localStorage.setItem('iis_invigilators', JSON.stringify(invigilators)), [invigilators]);
  useEffect(() => localStorage.setItem('iis_logo', JSON.stringify(globalLogo)), [globalLogo]);
  useEffect(() => localStorage.setItem('iis_completed', JSON.stringify(completedAttempts)), [completedAttempts]);

  // Session State
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [examResult, setExamResult] = useState<{ score: number, total: number, feedback: string, grade: string, subject: string } | null>(null);
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
        // Allow generic staff login OR specific user login
        if (u.role === UserRole.TEACHER) return (regNo === 'staff' && pin === 'school') || (u.id === regNo && u.pin === pin); 
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
    const grade = calculateGrade(score, total);
    
    // 1. Get AI Feedback
    const feedback = await explainPerformance(score, total, currentExamSubject);

    // 2. Record Result locally
    const newResult = {
      id: `r-${Date.now()}`,
      examId: currentExam.id,
      studentId: currentUser.id,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      score: score,
      totalScore: total,
      grade: grade,
      date: new Date().toISOString().split('T')[0]
    };
    setResults(prev => [newResult, ...prev]);

    // 3. Mark as completed for this session
    setCompletedAttempts(prev => [...prev, currentExam.id]);

    // 4. Update View
    setCurrentExam(null);
    setExamResult({ score, total, feedback, grade, subject: currentExamSubject });
    setLoading(false);
  };

  const calculateGrade = (score: number, total: number) => {
    if (total === 0) return 'N/A';
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-50">
        <Particles />
        <div className="w-full max-w-md p-8 relative z-10 animate-in zoom-in duration-300">
          <Card className="p-8 md:p-10 shadow-2xl border-t-4 border-brand-600 backdrop-blur-lg bg-white/95">
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4 relative">
                <div className="absolute inset-0 bg-brand-200 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <Logo className="w-24 h-24 relative z-10" src={globalLogo} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-brand-900 text-center">IISBenin CBT</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">Secure Assessment Portal</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="regNo">Registration / Staff ID</Label>
                <Input
                  id="regNo"
                  type="text"
                  value={regNo}
                  onChange={(e: any) => setRegNo(e.target.value)}
                  className="bg-slate-50"
                  placeholder="Enter your ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pin">Access PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e: any) => setPin(e.target.value)}
                  className="bg-slate-50"
                  placeholder="•••••"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 border border-red-100">
                   <Icons.ExclamationTriangle className="w-4 h-4 shrink-0" />
                   {error}
                </div>
              )}

              <Button type="submit" className="w-full py-3 text-base font-bold shadow-lg shadow-brand-200/50 transition-transform active:scale-[0.98]" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Restricted Access &bull; Indian International School Benin
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 2. Admin Dashboard
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
        invigilators={invigilators}
        onUpdateInvigilators={setInvigilators}
      />
    );
  }

  // 3. Teacher Dashboard
  if (currentUser.role === UserRole.TEACHER) {
    return (
      <TeacherDashboard 
        onLogout={handleLogout} 
        teacherName={currentUser.name}
        exams={exams.filter(e => e.title.includes(currentUser.name) || true)} // Show all exams for demo, in real app might filter by creator
        onAddExam={(newExam) => setExams(prev => [...prev, newExam])}
        results={results}
        globalLogo={globalLogo}
      />
    );
  }

  // 4. Exam Session (Active)
  if (currentExam) {
    return (
      <ExamSession 
        exam={currentExam} 
        student={currentUser}
        onSubmit={handleExamSubmit}
      />
    );
  }

  // 5. Exam Result View
  if (examResult) {
     return (
        <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <Particles />
            <Card className="max-w-lg w-full p-8 text-center relative z-10 animate-in zoom-in duration-300 shadow-2xl border-t-4 border-brand-600">
                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icons.CheckCircle className="w-10 h-10 text-brand-600" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-brand-900 mb-2">Submission Successful</h2>
                <p className="text-slate-500 mb-8">Your responses for <span className="font-bold text-brand-700">{examResult.subject}</span> have been recorded.</p>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Your Performance</p>
                    <div className="flex items-baseline justify-center gap-2">
                         <span className="text-5xl font-black text-brand-900">{examResult.score}</span>
                         <span className="text-xl text-slate-400 font-medium">/ {examResult.total}</span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Grade Achieved:</span>
                        <span className={`text-lg font-bold ${examResult.grade.startsWith('A') ? 'text-green-600' : 'text-brand-600'}`}>{examResult.grade}</span>
                    </div>
                </div>

                <div className="mb-8 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
                     <p className="text-xs font-bold text-blue-400 uppercase mb-1">AI Feedback</p>
                     <p className="text-sm text-blue-800 italic">"{examResult.feedback}"</p>
                </div>
                
                <Button onClick={() => setExamResult(null)} className="w-full py-3">
                    Return to Dashboard
                </Button>
            </Card>
        </div>
     );
  }

  // 6. Student Dashboard (Default)
  return (
    <StudentDashboard 
      student={currentUser}
      exams={exams}
      results={results.filter(r => r.studentId === currentUser.id)}
      completedExamIds={completedAttempts}
      onStartExam={(exam) => setCurrentExam(exam)}
      onLogout={handleLogout}
      globalLogo={globalLogo}
    />
  );
};

export default App;