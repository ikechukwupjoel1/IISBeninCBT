import React, { useState, useEffect } from 'react';
import { User, UserRole, Exam } from './types';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ExamSession from './components/ExamSession';
import { Button, Label, Card, Input } from './components/ui/UI';
import { Logo } from './components/ui/Logo';
import { Particles } from './components/ui/Particles';
import { explainPerformance } from './services/geminiService';
import { Icons } from './components/ui/Icons';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';

const App: React.FC = () => {
  // -- GLOBAL STATE --
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data State (Now from Supabase)
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  const [invigilators, setInvigilators] = useState<any[]>([]);
  const [globalLogo, setGlobalLogo] = useState<string>('');
  const [completedAttempts, setCompletedAttempts] = useState<string[]>([]);

  // Session State
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [examResult, setExamResult] = useState<{ score: number, total: number, feedback: string, grade: string, subject: string } | null>(null);

  // Login Form State
  const [regNo, setRegNo] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    const user = await authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      await loadUserData(user);
    }
    setLoading(false);
  };

  // Load data based on user role
  const loadUserData = async (user: User) => {
    try {
      // Load exams
      if (user.role === UserRole.STUDENT) {
        const { data: studentExams } = await databaseService.getExamsByClass(user.grade || '');
        if (studentExams) {
          // Fetch questions for each exam
          const examsWithQuestions = await Promise.all(
            studentExams.map(async (exam: any) => {
              const { data: examWithQuestions } = await databaseService.getExamById(exam.id);
              return examWithQuestions;
            })
          );
          setExams(examsWithQuestions.filter(Boolean));
        }

        // Load student results
        const { data: studentResults } = await databaseService.getResultsByStudent(user.id);
        if (studentResults) setResults(studentResults);
      } else {
        // Teachers and admins see all exams
        const { data: allExams } = await databaseService.getAllExams();
        if (allExams) {
          const examsWithQuestions = await Promise.all(
            allExams.map(async (exam: any) => {
              const { data: examWithQuestions } = await databaseService.getExamById(exam.id);
              return examWithQuestions;
            })
          );
          setExams(examsWithQuestions.filter(Boolean));
        }

        // Load all results for teachers/admins
        const { data: allResults } = await databaseService.getAllResults();
        if (allResults) setResults(allResults);
      }

      // Load users (for admin)
      if (user.role === UserRole.ADMIN) {
        const { data: allUsers } = await databaseService.getAllUsers();
        if (allUsers) setUsers(allUsers);
      }

      // Load halls
      const { data: hallsData } = await databaseService.getAllHalls();
      if (hallsData) setHalls(hallsData.map((h: any) => h.name));

      // Load invigilators
      const { data: invigilatorsData } = await databaseService.getAllInvigilatorAssignments();
      if (invigilatorsData) setInvigilators(invigilatorsData);

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    try {
      let result;

      // Try student login first (reg number + PIN)
      if (regNo.startsWith('IIS-')) {
        result = await authService.signInWithStudentCredentials(regNo, pin);
      }
      // Try email/password login for teachers and admins
      else if (regNo.includes('@')) {
        result = await authService.signInWithEmail(regNo, pin);
      }
      // Demo credentials fallback
      else if (regNo === 'admin' && pin === 'admin') {
        result = await authService.signInWithStudentCredentials('IIS-ADMIN', 'admin');
      } else if (regNo === 'staff' && pin === 'school') {
        result = await authService.signInWithEmail('teacher@demo.com', 'school');
      } else {
        // Try as student credentials anyway
        result = await authService.signInWithStudentCredentials(regNo, pin);
      }

      if (result.error || !result.user) {
        setError(result.error || 'Invalid credentials. Please check your ID/Email and PIN.');
      } else {
        setCurrentUser(result.user);
        await loadUserData(result.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setCurrentExam(null);
    setExamResult(null);
    setRegNo('');
    setPin('');
    setExams([]);
    setResults([]);
    setUsers([]);
  };

  // Handle Exam Submission
  const handleExamSubmit = async (answers: Record<string, any>) => {
    if (!currentExam || !currentUser) return;
    setLoginLoading(true);
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

    // 2. Submit result to Supabase
    const { data: newResult, error } = await databaseService.submitExamResult({
      examId: currentExam.id,
      studentId: currentUser.id,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      score: score,
      totalScore: total,
      grade: grade,
      answers: answers
    });

    if (error) {
      console.error('Error submitting result:', error);
      alert('Failed to submit exam. Please try again.');
      setLoginLoading(false);
      return;
    }

    // 3. Update local state
    if (newResult) {
      setResults(prev => [newResult, ...prev]);
    }

    // 4. Mark as completed for this session
    setCompletedAttempts(prev => [...prev, currentExam.id]);

    // 5. Update View
    setCurrentExam(null);
    setExamResult({ score, total, feedback, grade, subject: currentExamSubject });
    setLoginLoading(false);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
                <Label htmlFor="regNo">Registration No / Staff Email</Label>
                <Input
                  id="regNo"
                  type="text"
                  value={regNo}
                  onChange={(e: any) => setRegNo(e.target.value)}
                  className="bg-slate-50"
                  placeholder="ID or Email"
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

              <Button type="submit" className="w-full py-3 text-base font-bold shadow-lg shadow-brand-200/50 transition-transform active:scale-[0.98]" disabled={loginLoading}>
                {loginLoading ? 'Authenticating...' : 'Sign In to Portal'}
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
        teacherId={currentUser.id}
        exams={exams}
        onRefreshData={() => loadUserData(currentUser)}
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
      results={results.filter(r => r.student_id === currentUser.id)}
      completedExamIds={completedAttempts}
      onStartExam={(exam) => setCurrentExam(exam)}
      onLogout={handleLogout}
      globalLogo={globalLogo}
    />
  );
};

export default App;