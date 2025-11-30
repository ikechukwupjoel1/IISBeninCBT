import React, { useState, useEffect, useCallback } from 'react';
import { Exam, QuestionType } from '../types';
import { Button, Card, Badge } from './ui/UI';
import { Icons } from './ui/Icons';
import { Logo } from './ui/Logo';

interface ExamSessionProps {
  exam: Exam;
  student: any;
  onSubmit: (answers: Record<string, any>) => void;
  submitting?: boolean;
}

const ExamSession: React.FC<ExamSessionProps> = ({ exam, student, onSubmit, submitting = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  // Handle both camelCase (types) and snake_case (DB)
  const duration = (exam as any).duration_minutes || exam.durationMinutes || 0;
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // Prevent accidental close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleFinishExam = useCallback(() => {
    onSubmit(answers);
  }, [answers, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isMarked = markedForReview.has(currentQuestion.id);

  const toggleReview = () => {
    const newSet = new Set(markedForReview);
    if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id);
    else newSet.add(currentQuestion.id);
    setMarkedForReview(newSet);
  };

  const handleAnswer = (val: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans selection:bg-brand-200">
      {/* Header */}
      <header className="bg-brand-900 text-white px-6 py-3 flex items-center justify-between shadow-xl shrink-0 z-30 relative">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-lg shadow-sm">
            <Logo className="w-10 h-10" />
          </div>
          <div className="border-l border-brand-700 pl-4">
            <h1 className="text-lg font-bold leading-none tracking-tight">{exam.title}</h1>
            <div className="text-xs text-brand-300 mt-1 flex gap-3 font-medium">
              <span className="bg-brand-800 px-1.5 py-0.5 rounded">{exam.subject}</span>
              <span>&bull;</span>
              <span className="opacity-80">Candidate: {(student as any).reg_number || student.regNumber}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold border shadow-inner transition-colors duration-500 ${timeLeft < 300 ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-brand-950 border-brand-800 text-brand-50'}`}>
            <Icons.Clock className="w-5 h-5 opacity-75" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="danger" className="shadow-none border border-red-500 hover:bg-red-600 active:bg-red-700"
            disabled={submitting}
            onClick={() => {
              if (window.confirm("Are you sure you want to finish the exam? This cannot be undone.")) {
                handleFinishExam();
              }
            }}>
            {submitting ? 'Submitting...' : 'Finish & Submit'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
            <Logo className="w-96 h-96 grayscale" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-900">Question {currentQuestionIndex + 1}</span>
                <span className="text-xl font-medium text-slate-400">/ {exam.questions.length}</span>
              </div>
              <button
                onClick={toggleReview}
                className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 ${isMarked ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 shadow-inner' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50 border border-slate-200'}`}
              >
                <Icons.Flag className={`w-4 h-4 ${isMarked ? 'fill-current' : ''}`} />
                {isMarked ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            <Card className="p-12 min-h-[500px] flex flex-col justify-center shadow-material-lg border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-500"></div>

              <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed mb-12">
                {currentQuestion.text}
              </p>

              <div className="space-y-4 max-w-3xl">
                {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && currentQuestion.options?.map((opt) => (
                  <label
                    key={opt}
                    className={`group flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${answers[currentQuestion.id] === opt
                      ? 'border-brand-600 bg-brand-50 shadow-inner ring-1 ring-brand-100'
                      : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 hover:shadow-sm bg-white'
                      }`}
                  >
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-6 transition-colors shrink-0 ${answers[currentQuestion.id] === opt ? 'border-brand-600' : 'border-slate-300 group-hover:border-brand-400'}`}>
                      {answers[currentQuestion.id] === opt && <div className="w-3 h-3 rounded-full bg-brand-600"></div>}
                    </div>
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() => handleAnswer(opt)}
                      className="hidden"
                    />
                    <span className={`text-lg ${answers[currentQuestion.id] === opt ? 'text-brand-900 font-bold' : 'text-slate-700 font-medium'}`}>{opt}</span>
                  </label>
                ))}

                {currentQuestion.type === QuestionType.TRUE_FALSE && (
                  <div className="flex flex-col sm:flex-row gap-6">
                    {['True', 'False'].map((opt) => {
                      const val = opt === 'True';
                      return (
                        <label
                          key={opt}
                          className={`flex-1 flex items-center justify-center p-8 rounded-2xl border-2 cursor-pointer transition-all ${answers[currentQuestion.id] === val
                            ? 'border-brand-600 bg-brand-50 shadow-inner'
                            : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 bg-white'
                            }`}
                        >
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            checked={answers[currentQuestion.id] === val}
                            onChange={() => handleAnswer(val)}
                            className="hidden"
                          />
                          <span className={`text-xl font-bold ${answers[currentQuestion.id] === val ? 'text-brand-900' : 'text-slate-600'}`}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            <div className="mt-10 flex items-center justify-between">
              <Button
                variant="secondary"
                className="px-10 py-4 text-base"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                className="px-10 py-4 text-base font-bold shadow-xl shadow-brand-200 hover:shadow-brand-300 hover:-translate-y-0.5"
                onClick={() => {
                  if (currentQuestionIndex < exam.questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                  }
                }}
                disabled={currentQuestionIndex === exam.questions.length - 1}
              >
                Next Question
              </Button>
            </div>
          </div>
        </main>

        {/* Sidebar Navigation */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-2xl z-20">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 backdrop-blur">
            <h3 className="font-bold text-brand-900 text-lg flex items-center gap-2">
              <Icons.Dashboard className="w-5 h-5" />
              Question Palette
            </h3>
            <div className="flex flex-wrap gap-3 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-brand-600 rounded-sm"></div> Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-slate-200 rounded-sm"></div> Empty</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div> Flagged</div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-5 gap-3 overflow-y-auto content-start flex-1">
            {exam.questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = currentQuestionIndex === idx;
              const isFlagged = markedForReview.has(q.id);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`
                    relative h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                    ${isCurrent ? 'ring-2 ring-brand-900 ring-offset-2 z-10 bg-brand-900 text-white shadow-lg scale-110' : ''}
                    ${!isCurrent && isAnswered ? 'bg-brand-600 text-white shadow-md' : ''}
                    ${!isCurrent && !isAnswered ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : ''}
                  `}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-amber-400 rounded-full border-2 border-white shadow-sm z-20"></span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50 text-center">
            <div className="flex items-center justify-center gap-2 opacity-50 grayscale">
              <Logo className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest text-brand-900">SECURE BROWSER</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ExamSession;