-- Cleanup Script: Drop all existing objects to start fresh
-- Run this FIRST in Supabase SQL Editor

-- Drop policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Students can view assigned exams" ON exams;
DROP POLICY IF EXISTS "Teachers and admins can view all exams" ON exams;
DROP POLICY IF EXISTS "Teachers and admins can manage exams" ON exams;
DROP POLICY IF EXISTS "Students can view questions for their exams" ON questions;
DROP POLICY IF EXISTS "Teachers and admins can view all questions" ON questions;
DROP POLICY IF EXISTS "Teachers and admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Students can view own results" ON exam_results;
DROP POLICY IF EXISTS "Students can submit results" ON exam_results;
DROP POLICY IF EXISTS "Teachers and admins can view all results" ON exam_results;
DROP POLICY IF EXISTS "Admins can delete results" ON exam_results;
DROP POLICY IF EXISTS "Anyone can view halls" ON halls;
DROP POLICY IF EXISTS "Admins can manage halls" ON halls;
DROP POLICY IF EXISTS "Anyone can view assignments" ON invigilator_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments" ON invigilator_assignments;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS invigilator_assignments CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS halls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Success message
SELECT 'Cleanup complete! Now run the corrected schema.sql' AS message;
