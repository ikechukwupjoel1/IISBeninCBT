
import { Exam, ExamStatus, ExamType, QuestionType, User, UserRole } from "../types";

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
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4a7cbd&color=fff',
    grade: 'Grade 12'
  },
  {
    id: 'u3',
    name: 'Mr. Rajesh Kumar',
    role: UserRole.TEACHER,
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=36609e&color=fff'
  },
  {
    id: 'u4',
    name: 'Mrs. Priya Sharma',
    role: UserRole.TEACHER,
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=36609e&color=fff'
  }
];

export const MOCK_HALLS = [
  'Hall A (Science Block)',
  'Hall B (Arts Block)',
  'Computer Lab 1',
  'Computer Lab 2'
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
    type: ExamType.EXAM,
    allowedIps: [], // Empty means no restriction for now
    assignedClass: 'Grade 12',
    date: '2024-05-20',
    time: '09:00',
    questions: [
      {
        id: 'q1',
        text: 'What is the value of Pi (approximate)?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['3.14', '3.14159', '3.1415', '3.1416'],
        correctAnswer: '3.14',
        points: 2
      },
      {
        id: 'q2',
        text: 'Select all prime numbers from the list below:',
        type: QuestionType.MULTI_SELECT,
        options: ['2', '4', '11', '15', '19', '21'],
        correctAnswer: ['2', '11', '19'],
        points: 3
      },
      {
        id: 'q3',
        text: 'Match the capital cities to their countries:',
        type: QuestionType.MATCHING,
        matchingPairs: [
          { left: 'France', right: 'Paris' },
          { left: 'Japan', right: 'Tokyo' },
          { left: 'Egypt', right: 'Cairo' }
        ],
        correctAnswer: 'Paris,Tokyo,Cairo', // Simplified for internal checking or unused for Matching if logic differs
        points: 4
      },
      {
        id: 'q4',
        text: 'Identify this shape:',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Rectangle_example.svg/1280px-Rectangle_example.svg.png',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['Square', 'Rectangle', 'Trapezoid', 'Rhombus'],
        correctAnswer: 'Rectangle',
        points: 2
      },
      {
        id: 'q5',
        text: 'Which of these is a mammal?',
        type: QuestionType.MULTIPLE_CHOICE,
        options: ['Shark', 'Eagle', 'Dolphin', 'Frog'],
        optionImages: [
          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/White_shark.jpg/640px-White_shark.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/%C3%81guila_real_volando.jpg/640px-%C3%81guila_real_volando.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tursiops_truncatus_01.jpg/640px-Tursiops_truncatus_01.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Tree_frog2.jpg/640px-Tree_frog2.jpg'
        ],
        correctAnswer: 'Dolphin',
        points: 2
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
    type: ExamType.PRACTICE,
    assignedClass: 'Grade 11',
    date: '2024-06-15',
    time: '11:30',
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
