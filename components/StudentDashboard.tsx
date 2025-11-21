import React, { useState } from 'react';
import { MOCK_EXAMS, MOCK_RESULTS } from '../utils/mockData';
import { Button, Card, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';
import { Exam } from '../types';
import { Particles } from './ui/Particles';

interface StudentDashboardProps {
  student: any;
  onStartExam: (exam: Exam) => void;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onStartExam, onLogout }) => {
  const [view, setView] = useState<'exams' | 'results'>('exams');

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      <Particles />
      
      {/* Navbar */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" />
            <div>
                <h1 className="font-serif font-bold text-xl text-brand-900 leading-none">IISBenin</h1>
                <span className="text-xs text-slate-500 font-medium tracking-wide">Student Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 py-1.5 px-4 rounded-full bg-slate-50 border border-slate-100">
              <img src={student.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
              <div className="text-right pr-1">
                <p className="text-sm font-bold text-slate-800 leading-none">{student.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{student.regNumber}</p>
              </div>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
              <Icons.LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
                <button 
                    onClick={() => setView('exams')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'exams' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Upcoming Exams
                </button>
                <button 
                    onClick={() => setView('results')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'results' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    My Grades
                </button>
            </div>
        </div>

        {view === 'exams' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8 text-center md:text-left">
               <h2 className="text-2xl font-serif font-bold text-brand-900">Examination Dashboard</h2>
               <p className="text-slate-500">Select an active exam to begin your assessment.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_EXAMS.map((exam) => (
                <Card key={exam.id} className="flex flex-col h-full hover:shadow-soft transition-shadow duration-300 border-0 bg-white group overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-400 to-brand-600"></div>
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <Badge color={exam.status === 'ACTIVE' ? 'green' : 'gray'}>
                        {exam.status === 'ACTIVE' ? 'Live Now' : 'Upcoming'}
                      </Badge>
                      <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded">{exam.subject}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 line-clamp-2">{exam.title}</h3>
                    <div className="space-y-3 mt-6 border-t border-slate-50 pt-4">
                      <div className="flex items-center text-sm text-slate-600">
                         <Icons.Clock className="w-4 h-4 mr-3 text-slate-400" />
                         <span className="font-medium">{exam.durationMinutes} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                         <Icons.BookOpen className="w-4 h-4 mr-3 text-slate-400" />
                         <span className="font-medium">{exam.totalQuestions || exam.questions.length} Questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 pt-0 mt-auto">
                     <Button 
                       className="w-full py-3 font-bold shadow-md shadow-brand-200/50" 
                       disabled={exam.status !== 'ACTIVE'}
                       onClick={() => onStartExam(exam)}
                     >
                       {exam.status === 'ACTIVE' ? 'Start Assessment' : 'Locked'}
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8 text-center md:text-left">
               <h2 className="text-2xl font-serif font-bold text-brand-900">Academic History</h2>
               <p className="text-slate-500">Your recent performance records.</p>
             </div>
             
             <Card className="overflow-hidden border-0 shadow-soft">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Exam Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Score</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_RESULTS.map((result) => (
                            <tr key={result.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 text-sm text-slate-500">{result.date}</td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{result.subject}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{result.examTitle}</td>
                                <td className="px-6 py-4 text-sm font-bold text-brand-700">
                                    {result.score} / {result.totalScore}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${result.grade === 'A' ? 'bg-green-100 text-green-700' : result.grade === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {result.grade}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </Card>
           </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;