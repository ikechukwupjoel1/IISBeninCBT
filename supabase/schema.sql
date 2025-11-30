-- IISBenin CBT Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  reg_number TEXT UNIQUE, -- For students
  pin TEXT, -- For students (hashed in production)
  grade TEXT, -- For students
  subject TEXT, -- For teachers
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'EXPIRED')),
  assigned_class TEXT NOT NULL,
  exam_date DATE,
  exam_time TIME,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK')),
  options JSONB, -- Array of options for MCQ
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXAM RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  grade TEXT,
  answers JSONB, -- Store student answers as JSON
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id) -- Prevent duplicate submissions
);

-- ============================================
-- HALLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS halls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVIGILATOR ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invigilator_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  hall_id UUID REFERENCES halls(id) ON DELETE SET NULL,
  hall_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_reg_number ON users(reg_number);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_assigned_class ON exams(assigned_class);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE invigilator_assignments ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Allow admins to insert/update/delete users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- EXAMS TABLE POLICIES
-- Students can view exams assigned to their grade
CREATE POLICY "Students can view assigned exams" ON exams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'STUDENT' 
      AND grade = exams.assigned_class
    )
  );

-- Teachers and admins can view all exams
CREATE POLICY "Teachers and admins can view all exams" ON exams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('TEACHER', 'ADMIN')
    )
  );

-- Teachers and admins can create/update/delete exams
CREATE POLICY "Teachers and admins can manage exams" ON exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('TEACHER', 'ADMIN')
    )
  );

-- QUESTIONS TABLE POLICIES
-- Students can view questions for exams they can access
CREATE POLICY "Students can view questions for their exams" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams e
      JOIN users u ON u.id::text = auth.uid()::text
      WHERE e.id = questions.exam_id
      AND u.role = 'STUDENT'
      AND u.grade = e.assigned_class
    )
  );

-- Teachers and admins can view all questions
CREATE POLICY "Teachers and admins can view all questions" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('TEACHER', 'ADMIN')
    )
  );

-- Teachers and admins can manage questions
CREATE POLICY "Teachers and admins can manage questions" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('TEACHER', 'ADMIN')
    )
  );

-- EXAM RESULTS POLICIES
-- Students can view their own results
CREATE POLICY "Students can view own results" ON exam_results
  FOR SELECT USING (student_id::text = auth.uid()::text);

-- Students can insert their own results
CREATE POLICY "Students can submit results" ON exam_results
  FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

-- Teachers and admins can view all results
CREATE POLICY "Teachers and admins can view all results" ON exam_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role IN ('TEACHER', 'ADMIN')
    )
  );

-- Admins can delete results
CREATE POLICY "Admins can delete results" ON exam_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- HALLS TABLE POLICIES
-- Everyone can view halls
CREATE POLICY "Anyone can view halls" ON halls FOR SELECT USING (true);

-- Admins can manage halls
CREATE POLICY "Admins can manage halls" ON halls
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- INVIGILATOR ASSIGNMENTS POLICIES
-- Everyone can view assignments
CREATE POLICY "Anyone can view assignments" ON invigilator_assignments 
  FOR SELECT USING (true);

-- Admins can manage assignments
CREATE POLICY "Admins can manage assignments" ON invigilator_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invigilator_assignments_updated_at BEFORE UPDATE ON invigilator_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Demo Users and Halls)
-- ============================================

-- Insert demo halls
INSERT INTO halls (name, capacity) VALUES
  ('Hall A (Science Block)', 50),
  ('Hall B (Arts Block)', 40),
  ('Computer Lab 1', 30),
  ('Computer Lab 2', 30)
ON CONFLICT (name) DO NOTHING;

-- Note: Users will be created through authentication
-- Initial admin user should be created manually or through Supabase Auth
