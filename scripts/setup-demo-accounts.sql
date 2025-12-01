-- Setup Demo Teacher/Admin Accounts
-- This script creates Supabase Auth accounts for demo users
-- Run this in Supabase SQL Editor after running seed.sql

-- Note: Supabase Auth users are typically created via the API
-- For production, use the Supabase Dashboard or Auth API
-- These instructions assume you're manually creating users

/*
MANUAL SETUP INSTRUCTIONS:
==========================

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create these accounts:

ADMIN ACCOUNT:
--------------
Email: admin@iisbenin.edu
Password: admin123
Confirm password: admin123
Auto Confirm User: YES (check this box)

After creating, note the User ID and update the users table:

UPDATE users 
SET id = 'PASTE_THE_AUTH_USER_ID_HERE'
WHERE email = 'admin@iisbenin.edu';

TEACHER ACCOUNTS:
-----------------
Email: rajesh.kumar@iisbenin.edu  
Password: teacher123
Auto Confirm User: YES

Email: priya.sharma@iisbenin.edu
Password: teacher123
Auto Confirm User: YES

Update their IDs:

UPDATE users 
SET id = 'PASTE_RAJESH_AUTH_ID_HERE'
WHERE email = 'rajesh.kumar@iisbenin.edu';

UPDATE users 
SET id = 'PASTE_PRIYA_AUTH_ID_HERE'
WHERE email = 'priya.sharma@iisbenin.edu';

ALTERNATIVE - Quick Demo Setup:
================================
If you want quick demo accounts without email confirmation:
*/

-- Create a simple demo account that bypasses Supabase Auth
-- This is for DEMO ONLY - not secure for production

-- Insert demo admin (if doesn't exist from seed.sql)
INSERT INTO users (
  id,
  name, 
  email, 
  role, 
  avatar
) VALUES (
  'demo-admin-001',
  'Demo Administrator',
  'admin@demo.com',
  'ADMIN',
  'https://ui-avatars.com/api/?name=Demo+Admin&background=1e3655&color=fff'
) ON CONFLICT (id) DO NOTHING;

-- Insert demo teacher
INSERT INTO users (
  id,
  name,
  email, 
  role,
  subject,
  phone,
  avatar
) VALUES (
  'demo-teacher-001',
  'Demo Teacher',
  'teacher@demo.com',
  'TEACHER',
  'Mathematics',
  '+229-99999999',
  'https://ui-avatars.com/api/?name=Demo+Teacher&background=36609e&color=fff'
) ON CONFLICT (id) DO NOTHING;

/*
Then create matching Auth accounts in Supabase Dashboard:
- Email: admin@demo.com, Password: admin
- Email: teacher@demo.com, Password: school
*/
