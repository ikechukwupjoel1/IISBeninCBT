
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK'
}

export enum ExamStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface User {
  id: string;
  name: string;
  regNumber?: string; // For students
  pin?: string;      // For students
  role: UserRole;
  avatar?: string;
  grade?: string;
  email?: string;    // For teachers
  phone?: string;    // For teachers
  subject?: string;  // For teachers
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MCQ
  correctAnswer: string | boolean;
  points: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
  status: ExamStatus;
  startTime?: Date;
  endTime?: Date;
  assignedClass: string;
  date?: string;
  time?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  totalScore: number;
  answers: Record<string, string | boolean>; // questionId -> answer
  submittedAt: Date;
}

export interface InvigilatorAssignment {
  id: string;
  staffId: string;
  staffName: string;
  hallName: string;
  status: 'Active' | 'Inactive';
}

// For AI Generation
export interface AIQuestionRequest {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}