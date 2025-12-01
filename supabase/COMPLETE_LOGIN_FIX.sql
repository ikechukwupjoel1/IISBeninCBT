-- Complete Fix for Student Login
-- Run ALL of these commands in Supabase SQL Editor

-- Step 1: Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Drop existing function if it exists
DROP FUNCTION IF EXISTS verify_student_login(TEXT, TEXT);

-- Step 3: Create new function that works with plaintext PINs
-- Returns user data in both snake_case and camelCase for compatibility
CREATE OR REPLACE FUNCTION verify_student_login(reg_num TEXT, input_pin TEXT)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  role TEXT,
  reg_number TEXT,
  "regNumber" TEXT,
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
    u.reg_number AS "regNumber",
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

-- Step 4: Grant permissions to allow anonymous calls
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO authenticated;

-- Step 5: Ensure demo student exists with correct data
-- First, check if student already exists
DO $$
BEGIN
  -- Try to update existing student
  UPDATE users 
  SET pin = '12345', 
      reg_number = 'IIS-2024-001',
      role = 'STUDENT',
      name = 'John Doe',
      grade = 'Grade 12'
  WHERE reg_number = 'IIS-2024-001';
  
  -- If no rows updated, insert new student with generated UUID
  IF NOT FOUND THEN
    INSERT INTO users (name, reg_number, pin, role, grade, avatar) 
    VALUES (
      'John Doe',
      'IIS-2024-001',
      '12345',
      'STUDENT',
      'Grade 12',
      'https://ui-avatars.com/api/?name=John+Doe&background=4a7cbd&color=fff'
    );
  END IF;
END $$;

-- Step 6: Test the function (should return 1 row with student data)
SELECT * FROM verify_student_login('IIS-2024-001', '12345');

-- Step 7: Verify student exists in users table
SELECT id, name, reg_number, pin, role, grade FROM users WHERE role = 'STUDENT' LIMIT 5;

-- If you see results from Step 6 and Step 7, student login should work!
