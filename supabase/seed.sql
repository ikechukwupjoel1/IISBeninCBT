-- Seed Script for Initial Demo Data
-- Run this AFTER running schema.sql

-- Insert demo users (Note: In production, use proper authentication)
-- These are for demonstration purposes

-- Admin User
INSERT INTO users (id, name, email, role, avatar) VALUES
  ('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@iisbenin.edu', 'ADMIN', 'https://ui-avatars.com/api/?name=Admin+User&background=1e3655&color=fff')
ON CONFLICT (id) DO NOTHING;

-- Teacher Users
INSERT INTO users (id, name, email, role, subject, phone, avatar) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Mr. Rajesh Kumar', 'rajesh.kumar@iisbenin.edu', 'TEACHER', 'Mathematics', '+229-12345678', 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=36609e&color=fff'),
  ('00000000-0000-0000-0000-000000000003', 'Mrs. Priya Sharma', 'priya.sharma@iisbenin.edu', 'TEACHER', 'Science', '+229-87654321', 'https://ui-avatars.com/api/?name=Priya+Sharma&background=36609e&color=fff')
ON CONFLICT (id) DO NOTHING;

-- Student Users
INSERT INTO users (id, name, reg_number, pin, role, grade, avatar) VALUES
  ('00000000-0000-0000-0000-000000000004', 'John Doe', 'IIS-2024-001', '12345', 'STUDENT', 'Grade 12', 'https://ui-avatars.com/api/?name=John+Doe&background=4a7cbd&color=fff'),
  ('00000000-0000-0000-0000-000000000005', 'Jane Smith', 'IIS-2024-002', '12345', 'STUDENT', 'Grade 12', 'https://ui-avatars.com/api/?name=Jane+Smith&background=4a7cbd&color=fff'),
  ('00000000-0000-0000-0000-000000000006', 'Michael Johnson', 'IIS-2024-003', '12345', 'STUDENT', 'Grade 11', 'https://ui-avatars.com/api/?name=Michael+Johnson&background=4a7cbd&color=fff')
ON CONFLICT (id) DO NOTHING;

-- Insert a demo exam
INSERT INTO exams (id, title, subject, duration_minutes, total_questions, status, assigned_class, exam_date, exam_time, created_by) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Mathematics Mid-Term', 'Mathematics', 15, 5, 'ACTIVE', 'Grade 12', '2024-05-20', '09:00', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Insert demo questions for the exam
INSERT INTO questions (exam_id, text, type, options, correct_answer, points, explanation) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Solve for x: 2x + 5 = 15', 'MULTIPLE_CHOICE', '["5", "10", "7.5", "2.5"]', '5', 2, 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5'),
  ('00000000-0000-0000-0000-000000000101', 'What is the square root of 144?', 'MULTIPLE_CHOICE', '["10", "11", "12", "13"]', '12', 2, '12 × 12 = 144'),
  ('00000000-0000-0000-0000-000000000101', 'A triangle has three sides.', 'TRUE_FALSE', null, 'true', 1, 'By definition, a triangle is a polygon with three sides'),
  ('00000000-0000-0000-0000-000000000101', 'Calculate the area of a rectangle with length 5cm and width 3cm.', 'MULTIPLE_CHOICE', '["15cm²", "8cm²", "10cm²", "25cm²"]', '15cm²', 2, 'Area = length × width = 5 × 3 = 15cm²'),
  ('00000000-0000-0000-0000-000000000101', 'Pi is an integer.', 'TRUE_FALSE', null, 'false', 1, 'Pi (π ≈ 3.14159...) is an irrational number, not an integer')
ON CONFLICT DO NOTHING;

-- Insert demo exam results
INSERT INTO exam_results (exam_id, student_id, exam_title, subject, score, total_score, grade, answers) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000005', 'Mathematics Mid-Term', 'Mathematics', 8, 8, 'A+', '{}')
ON CONFLICT (exam_id, student_id) DO NOTHING;

-- Insert invigilator assignments
INSERT INTO invigilator_assignments (staff_id, staff_name, hall_name, status) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Mr. Rajesh Kumar', 'Hall A (Science Block)', 'Active'),
  ('00000000-0000-0000-0000-000000000003', 'Mrs. Priya Sharma', 'Computer Lab 1', 'Active')
ON CONFLICT DO NOTHING;
