import { supabase } from './supabaseClient';
import { Exam, Question, User, UserRole } from '../types';

/**
 * Database Service
 * Handles all database operations for the CBT platform
 */

export const databaseService = {
    // ============================================
    // USERS
    // ============================================

    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get all users error:', error);
            return { data: null, error: error.message };
        }
    },

    async getUserById(userId: string) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get user by ID error:', error);
            return { data: null, error: error.message };
        }
    },

    async createUser(user: Partial<User>) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    reg_number: user.regNumber,
                    pin: user.pin,
                    grade: user.grade,
                    subject: user.subject,
                    phone: user.phone,
                    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4a7cbd&color=fff`,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Create user error:', error);
            return { data: null, error: error.message };
        }
    },

    async updateUser(userId: string, updates: Partial<User>) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                    name: updates.name,
                    email: updates.email,
                    role: updates.role,
                    reg_number: updates.regNumber,
                    pin: updates.pin,
                    grade: updates.grade,
                    subject: updates.subject,
                    phone: updates.phone,
                    avatar: updates.avatar,
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Update user error:', error);
            return { data: null, error: error.message };
        }
    },

    async deleteUser(userId: string) {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('Delete user error:', error);
            return { error: error.message };
        }
    },

    // ============================================
    // EXAMS
    // ============================================

    async getAllExams() {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get all exams error:', error);
            return { data: null, error: error.message };
        }
    },

    async getExamsByClass(className: string) {
        try {
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .eq('assigned_class', className)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get exams by class error:', error);
            return { data: null, error: error.message };
        }
    },

    async getExamById(examId: string) {
        try {
            const { data: exam, error: examError } = await supabase
                .from('exams')
                .select('*')
                .eq('id', examId)
                .single();

            if (examError) throw examError;

            // Get questions for this exam
            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select('*')
                .eq('exam_id', examId);

            if (questionsError) throw questionsError;

            // Parse options from JSON string and normalize field names
            const normalizedQuestions = questions?.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type,
                options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
                correctAnswer: q.correct_answer,
                points: q.points || 1,
                explanation: q.explanation
            })) || [];

            // Normalize exam field names from snake_case to camelCase
            const normalizedExam = {
                id: exam.id,
                title: exam.title,
                subject: exam.subject,
                durationMinutes: exam.duration_minutes,
                totalQuestions: exam.total_questions,
                status: exam.status,
                assignedClass: exam.assigned_class,
                date: exam.exam_date,
                time: exam.exam_time,
                questions: normalizedQuestions
            };

            return { data: normalizedExam, error: null };
        } catch (error: any) {
            console.error('Get exam by ID error:', error);
            return { data: null, error: error.message };
        }
    },

    async createExam(exam: Partial<Exam>, createdBy: string) {
        try {
            // Create exam
            const { data: examData, error: examError } = await supabase
                .from('exams')
                .insert({
                    title: exam.title,
                    subject: exam.subject,
                    duration_minutes: exam.durationMinutes,
                    total_questions: exam.questions?.length || 0,
                    status: exam.status,
                    assigned_class: exam.assignedClass,
                    exam_date: exam.date,
                    exam_time: exam.time,
                    created_by: createdBy,
                })
                .select()
                .single();

            if (examError) throw examError;

            // Create questions if provided
            if (exam.questions && exam.questions.length > 0) {
                const questionsToInsert = exam.questions.map((q: Question) => ({
                    exam_id: examData.id,
                    text: q.text,
                    type: q.type,
                    options: q.options ? JSON.stringify(q.options) : null,
                    correct_answer: String(q.correctAnswer),
                    points: q.points,
                    explanation: q.explanation,
                }));

                const { error: questionsError } = await supabase
                    .from('questions')
                    .insert(questionsToInsert);

                if (questionsError) throw questionsError;
            }

            return { data: examData, error: null };
        } catch (error: any) {
            console.error('Create exam error:', error);
            return { data: null, error: error.message };
        }
    },

    async updateExam(examId: string, updates: Partial<Exam>) {
        try {
            const { data, error } = await supabase
                .from('exams')
                .update({
                    title: updates.title,
                    subject: updates.subject,
                    duration_minutes: updates.durationMinutes,
                    status: updates.status,
                    assigned_class: updates.assignedClass,
                    exam_date: updates.date,
                    exam_time: updates.time,
                })
                .eq('id', examId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Update exam error:', error);
            return { data: null, error: error.message };
        }
    },

    async deleteExam(examId: string) {
        try {
            // Questions will be deleted automatically due to CASCADE
            const { error } = await supabase
                .from('exams')
                .delete()
                .eq('id', examId);

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error('Delete exam error:', error);
            return { error: error.message };
        }
    },

    // ============================================
    // EXAM RESULTS
    // ============================================

    async getResultsByStudent(studentId: string) {
        try {
            const { data, error } = await supabase
                .from('exam_results')
                .select('*')
                .eq('student_id', studentId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get results by student error:', error);
            return { data: null, error: error.message };
        }
    },

    async getResultsByExam(examId: string) {
        try {
            const { data, error } = await supabase
                .from('exam_results')
                .select('*, users(name, reg_number)')
                .eq('exam_id', examId)
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get results by exam error:', error);
            return { data: null, error: error.message };
        }
    },

    async getAllResults() {
        try {
            const { data, error } = await supabase
                .from('exam_results')
                .select('*')
                .order('submitted_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get all results error:', error);
            return { data: null, error: error.message };
        }
    },

    async submitExamResult(result: {
        examId: string;
        studentId: string;
        examTitle: string;
        subject: string;
        score: number;
        totalScore: number;
        grade: string;
        answers: Record<string, any>;
    }) {
        try {
            const { data, error } = await supabase
                .from('exam_results')
                .insert({
                    exam_id: result.examId,
                    student_id: result.studentId,
                    exam_title: result.examTitle,
                    subject: result.subject,
                    score: result.score,
                    total_score: result.totalScore,
                    grade: result.grade,
                    answers: result.answers,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Submit exam result error:', error);
            return { data: null, error: error.message };
        }
    },

    // ============================================
    // HALLS
    // ============================================

    async getAllHalls() {
        try {
            const { data, error } = await supabase
                .from('halls')
                .select('*')
                .order('name');

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get all halls error:', error);
            return { data: null, error: error.message };
        }
    },

    // ============================================
    // INVIGILATOR ASSIGNMENTS
    // ============================================

    async getAllInvigilatorAssignments() {
        try {
            const { data, error } = await supabase
                .from('invigilator_assignments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Get all invigilator assignments error:', error);
            return { data: null, error: error.message };
        }
    },

    async createInvigilatorAssignment(assignment: {
        staffId: string;
        staffName: string;
        hallName: string;
        status: 'Active' | 'Inactive';
    }) {
        try {
            const { data, error } = await supabase
                .from('invigilator_assignments')
                .insert({
                    staff_id: assignment.staffId,
                    staff_name: assignment.staffName,
                    hall_name: assignment.hallName,
                    status: assignment.status,
                })
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error: any) {
            console.error('Create invigilator assignment error:', error);
            return { data: null, error: error.message };
        }
    },
};
