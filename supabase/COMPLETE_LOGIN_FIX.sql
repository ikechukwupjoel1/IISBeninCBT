-- Complete Fix for Student Login
-- Run ALL of these commands in Supabase SQL Editor

-- Step 1: Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Drop existing function if it exists
DROP FUNCTION IF EXISTS verify_student_login(TEXT, TEXT);

-- Step 3: Create new function that works with plaintext PINs
CREATE OR REPLACE FUNCTION verify_student_login(reg_num TEXT, input_pin TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  role TEXT,
  reg_number TEXT,
  regNumber TEXT,
  grade TEXT,
  avatar TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::TEXT,
    u.name,
    u.role,
    u.reg_number,
    u.reg_number AS regNumber,
    u.grade,
    u.avatar,
    u.email,
    u.phone,
    u.created_at
  FROM users u
  WHERE u.reg_number = reg_num
    AND u.role = 'STUDENT'
    AND u.pin = input_pin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO authenticated;

-- Step 5: Insert demo student if doesn't exist
INSERT INTO users (id, name, reg_number, pin, role, grade, avatar) 
VALUES (
  'demo-student-001',
  'John Doe',
  'IIS-2024-001',
  '12345',
  'STUDENT',
  'Grade 12',
  'https://ui-avatars.com/api/?name=John+Doe&background=4a7cbd&color=fff'
) ON CONFLICT (id) DO UPDATE 
SET pin = '12345', reg_number = 'IIS-2024-001';

-- Step 6: Test the function (should return 1 row)
SELECT * FROM verify_student_login('IIS-2024-001', '12345');

-- Step 7: Verify student exists
SELECT id, name, reg_number, pin, role FROM users WHERE role = 'STUDENT';
