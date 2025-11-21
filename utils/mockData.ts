import { Exam, ExamStatus, QuestionType, User, UserRole } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'System Administrator',
    role: UserRole.ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=1e3655&color=fff'
  },
  {
    id: 'u2',
    name: 'John Doe',
    regNumber: 'IIS-2024-001',
    pin: '12345',
    role: UserRole.STUDENT,
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4a7cbd&color=fff'
  },
  {
    id: 'u3',
    name: 'Mr. Rajesh Kumar',
    role: UserRole.TEACHER,
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=36609e&color=fff'
  }
];

export const MOCK_RESULTS = [
  {
    id: 'r1',
    examTitle: 'Biology 101 - Introduction',
    subject: 'Biology',
    score: 18,
    totalScore: 20,
    grade: 'A',
    date: '2024-01-15'
  },
  {
    id: 'r2',
    examTitle: 'English Literature Test',
    subject: 'English',
    score: 45,
    totalScore: 50,
    grade: 'A',
    date: '2024-02-10'
  },
  {
    id: 'r3',
    examTitle: 'Chemistry Periodic Table',
    subject: 'Chemistry',
    score: 12,
    totalScore: 20,
    grade: 'C',
    date: '2024-03-05'
  }
];

export const MOCK_INVIGILATORS = [
  { id: 'i1', name: 'Mrs. Sarah Johnson', assignedRoom: 'Hall A', status: 'Active' },
  { id: 'i2', name: 'Mr. David Okafor', assignedRoom: 'Hall B', status: 'Active' },
  { id: 'i3', name: 'Ms. Priya Patel', assignedRoom: 'Lab 1', status: 'Inactive' },
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'e1',
    title: 'Mathematics Mid-Term',
    subject: 'Mathematics',
    durationMinutes: 15,
    totalQuestions: 5,
    status: ExamStatus.ACTIVE,
    assignedClass: 'SS3',
    questions: [
      {
        id: 'q1',
        text: 'Solve for x: 2x + 5 = 15',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['5', '10', '7.5', '2.5'],
        correctAnswer: '5',
        points: 2
      },
      {
        id: 'q2',
        text: 'What is the square root of 144?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['10', '11', '12', '13'],
        correctAnswer: '12',
        points: 2
      },
      {
        id: 'q3',
        text: 'A triangle has three sides.',
        type: QuestionType.TRUE_FALSE,
        correctAnswer: true,
        points: 1
      },
      {
        id: 'q4',
        text: 'Calculate the area of a rectangle with length 5cm and width 3cm.',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['15cm²', '8cm²', '10cm²', '25cm²'],
        correctAnswer: '15cm²',
        points: 2
      },
      {
        id: 'q5',
        text: 'Pi is an integer.',
        type: QuestionType.TRUE_FALSE,
        correctAnswer: false,
        points: 1
      }
    ]
  },
  {
    id: 'e2',
    title: 'Physics - Motion',
    subject: 'Physics',
    durationMinutes: 30,
    totalQuestions: 0, // Placeholder
    status: ExamStatus.SCHEDULED,
    assignedClass: 'SS2',
    questions: []
  }
];

export const MOCK_STATS = [
  { name: 'Math', pass: 85, fail: 15 },
  { name: 'Eng', pass: 92, fail: 8 },
  { name: 'Phy', pass: 65, fail: 35 },
  { name: 'Chem', pass: 70, fail: 30 },
  { name: 'Bio', pass: 88, fail: 12 },
];