# Quick Fix: Bypass Email Confirmation for Demo Accounts

## Problem
Teacher/Admin login failing because Supabase Auth accounts either:
1. Don't exist yet
2. Email isn't confirmed

## Immediate Solution (2 steps):

### Step 1: Create Auth Accounts in Supabase Dashboard

1. **Go to Supabase Authentication:**
   https://supabase.com/dashboard/project/kbetovvbispxqafanmdv/auth/users

2. **Click "Add User" (top right)**

3. **Create Admin Account:**
   - Email: `admin@demo.com`
   - Password: `admin`
   - ✅ **IMPORTANT: Check "Auto Confirm User"** ← This bypasses email verification
   - Click "Create User"

4. **Create Teacher Account:**
   - Click "Add User" again
   - Email: `teacher@demo.com`
   - Password: `school`
   - ✅ **Check "Auto Confirm User"**
   - Click "Create User"

### Step 2: Link Accounts to User Profiles

After creating the Auth accounts, you'll see their User IDs (UUID).

Run this SQL in Supabase SQL Editor:

```sql
-- Option A: If you want to link existing profiles
-- Replace 'AUTH_USER_ID_HERE' with the actual UUID from Step 1

-- For admin account
UPDATE users 
SET id = 'PASTE_ADMIN_AUTH_UUID_HERE'
WHERE email = 'admin@iisbenin.edu';

-- For teacher account  
UPDATE users
SET id = 'PASTE_TEACHER_AUTH_UUID_HERE'
WHERE email = 'rajesh.kumar@iisbenin.edu';

-- Option B: Create new demo profiles (easier)
-- This creates fresh profiles linked to the Auth accounts

INSERT INTO users (id, name, email, role, avatar) 
VALUES 
  ('PASTE_ADMIN_AUTH_UUID_HERE', 'Demo Admin', 'admin@demo.com', 'ADMIN', 
   'https://ui-avatars.com/api/?name=Demo+Admin&background=1e3655&color=fff')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO users (id, name, email, role, subject, avatar)
VALUES
  ('PASTE_TEACHER_AUTH_UUID_HERE', 'Demo Teacher', 'teacher@demo.com', 'TEACHER', 'Mathematics',
   'https://ui-avatars.com/api/?name=Demo+Teacher&background=36609e&color=fff')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
```

## Alternative: Disable Email Confirmation Globally

If you want all future signups to skip email verification:

1. **Go to Authentication Settings:**
   https://supabase.com/dashboard/project/kbetovvbispxqafanmdv/auth/configuration

2. **Scroll to "Email Auth"**

3. **Toggle OFF "Enable email confirmations"**

4. **Save**

## Test After Setup:

- Admin: `admin@demo.com` / `admin`
- Teacher: `teacher@demo.com` / `school`

Both should now login successfully! ✅
