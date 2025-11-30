-- IISBenin CBT Platform Database Schema (FIXED)
-- Run this in Supabase SQL Editor AFTER running cleanup.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  reg_number TEXT UNIQUE,
  pin TEXT,
  grade TEXT,
  subject TEXT,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXAMS TABLE
-- ============================================
CREATE TABLE exams (
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
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EXAM RESULTS TABLE
-- ============================================
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  grade TEXT,
  answers JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- ============================================
-- HALLS TABLE
-- ============================================
CREATE TABLE halls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVIGILATOR ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE invigilator_assignments (
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
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_reg_number ON users(reg_number);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_assigned_class ON exams(assigned_class);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_exam_results_student_id ON exam_results(student_id);
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES - FIXED
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE invigilator_assignments ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Allow public read access (simplified to avoid recursion)
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT USING (true);

-- Allow public insert (for registration)
CREATE POLICY "Allow public insert to users" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- EXAMS TABLE POLICIES
-- Allow public read access to exams
CREATE POLICY "Allow public read access to exams" ON exams
  FOR SELECT USING (true);

-- Allow public insert/update/delete for exams
CREATE POLICY "Allow public write access to exams" ON exams
  FOR ALL USING (true);

-- QUESTIONS TABLE POLICIES
-- Allow public access to questions
CREATE POLICY "Allow public access to questions" ON questions
  FOR ALL USING (true);

-- EXAM RESULTS POLICIES
-- Allow public access to results
CREATE POLICY "Allow public access to exam_results" ON exam_results
  FOR ALL USING (true);

-- HALLS TABLE POLICIES
-- Allow public access to halls
CREATE POLICY "Allow public access to halls" ON halls
  FOR ALL USING (true);

-- INVIGILATOR ASSIGNMENTS POLICIES
-- Allow public access to assignments
CREATE POLICY "Allow public access to invigilator_assignments" ON invigilator_assignments
  FOR ALL USING (true);

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
-- SEED DATA (Demo Halls)
-- ============================================

-- Insert demo halls
INSERT INTO halls (name, capacity) VALUES
  ('Hall A (Science Block)', 50),
  ('Hall B (Arts Block)', 40),
  ('Computer Lab 1', 30),
  ('Computer Lab 2', 30)
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Schema created successfully! Now run seed.sql' AS message;
