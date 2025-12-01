-- Link Auth Accounts to User Profiles
-- After creating Auth accounts in Supabase Dashboard, run this SQL

-- Step 1: Check what Auth accounts exist
-- Go to Dashboard → Authentication → Users
-- Copy the UUID for admin@demo.com and teacher@demo.com

-- Step 2: Replace 'PASTE_ADMIN_UUID' and 'PASTE_TEACHER_UUID' below
-- with the actual UUIDs from Step 1

-- Delete old demo accounts if they exist
DELETE FROM users WHERE email IN ('admin@demo.com', 'teacher@demo.com');

-- Insert admin profile linked to Auth account
INSERT INTO users (
  id,  -- IMPORTANT: This must match the Auth user UUID
  name,
  email,
  role,
  avatar
) VALUES (
  'PASTE_ADMIN_UUID_HERE',  -- ← Replace this with actual UUID from Auth dashboard
  'Demo Administrator',
  'admin@demo.com',
  'ADMIN',
  'https://ui-avatars.com/api/?name=Demo+Admin&background=1e3655&color=fff'
);

-- Insert teacher profile linked to Auth account
INSERT INTO users (
  id,  -- IMPORTANT: This must match the Auth user UUID
  name,
  email,
  role,
  subject,
  phone,
  avatar
) VALUES (
  'PASTE_TEACHER_UUID_HERE',  -- ← Replace this with actual UUID from Auth dashboard
  'Demo Teacher',
  'teacher@demo.com',
  'TEACHER',
  'Mathematics',
  '+229-99999999',
  'https://ui-avatars.com/api/?name=Demo+Teacher&background=36609e&color=fff'
);

-- Verify the profiles were created
SELECT id, name, email, role FROM users WHERE email IN ('admin@demo.com', 'teacher@demo.com');
