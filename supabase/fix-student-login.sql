-- Fix Student Login - Support Both Hashed and Plaintext PINs
-- This is a transitional fix while migrating from plaintext to hashed PINs
-- Run this in Supabase SQL Editor

-- Drop existing function
DROP FUNCTION IF EXISTS verify_student_login(TEXT, TEXT);

-- Recreate with fallback to plaintext if hash fails
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
    u.reg_number AS regNumber, -- Alias for camelCase
    u.grade,
    u.avatar,
    u.email,
    u.phone,
    u.created_at
  FROM users u
  WHERE u.reg_number = reg_num
    AND u.role = 'STUDENT'
    AND (
      -- Try hashed PIN first
      (u.pin IS NOT NULL AND length(u.pin) = 60 AND verify_pin(input_pin, u.pin))
      OR
      -- Fallback to plaintext comparison for unmigrated accounts
      (u.pin = input_pin)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_student_login(TEXT, TEXT) TO authenticated;

-- Test the function
SELECT * FROM verify_student_login('IIS-2024-001', '12345');
