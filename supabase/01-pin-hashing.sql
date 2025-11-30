-- ============================================
-- STEP 1: PIN HASHING SECURITY IMPLEMENTATION
-- ============================================
-- Run this in Supabase SQL Editor
-- This script sets up secure PIN hashing for student authentication

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- FUNCTION: hash_pin
-- Purpose: Hash a plaintext PIN using bcrypt
-- ============================================
CREATE OR REPLACE FUNCTION hash_pin(pin_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(pin_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: verify_pin
-- Purpose: Verify a PIN against its hash
-- ============================================
CREATE OR REPLACE FUNCTION verify_pin(pin_text TEXT, pin_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN pin_hash = crypt(pin_text, pin_hash);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RPC FUNCTION: verify_student_login
-- Purpose: Authenticate student with reg number and PIN
-- Returns: User data if credentials are valid
-- ============================================
CREATE OR REPLACE FUNCTION verify_student_login(reg_num TEXT, input_pin TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role TEXT,
  reg_number TEXT,
  grade TEXT,
  avatar TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.role,
    u.reg_number,
    u.grade,
    u.avatar,
    u.email,
    u.phone,
    u.created_at
  FROM users u
  WHERE u.reg_number = reg_num
    AND u.role = 'STUDENT'
    AND verify_pin(input_pin, u.pin);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TEST THE FUNCTIONS
-- ============================================
-- Test 1: Hash a PIN
SELECT hash_pin('12345') AS hashed_pin;

-- Test 2: Verify a PIN (should return true)
SELECT verify_pin('12345', hash_pin('12345')) AS is_valid;

-- Test 3: Verify wrong PIN (should return false)
SELECT verify_pin('wrong', hash_pin('12345')) AS is_valid;

-- ============================================
-- MIGRATION: Hash existing PINs
-- ⚠️ IMPORTANT: Backup your database first!
-- ============================================
-- This will convert all existing plaintext PINs to hashed format
-- Run this ONLY ONCE after backing up your database

UPDATE users 
SET pin = hash_pin(pin)
WHERE role = 'STUDENT' 
  AND pin IS NOT NULL
  AND length(pin) < 60; -- Only hash if not already hashed (bcrypt hashes are 60 chars)

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that PINs are now hashed (should be 60 characters)
SELECT 
  reg_number, 
  name,
  length(pin) as pin_length,
  substring(pin, 1, 10) as pin_preview
FROM users 
WHERE role = 'STUDENT'
LIMIT 5;

-- Test login with demo student
SELECT * FROM verify_student_login('IIS-2024-001', '12345');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'PIN hashing setup complete! ✅' AS status,
       'PINs are now securely hashed using bcrypt' AS message,
       'Update authService.ts to use verify_student_login RPC' AS next_step;
