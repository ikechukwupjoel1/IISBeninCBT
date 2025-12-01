# Quick Fix: Create Demo Teacher/Admin Accounts

## Problem
Cannot login as teacher or admin because Supabase Auth accounts don't exist.

## Solution: Manual Setup (5 minutes)

### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/kbetovvbispxqafanmdv
   - Navigate to: **Authentication** → **Users**

2. **Create Admin Account:**
   - Click **"Add User"** (top right)
   - Email: `admin@demo.com`
   - Password: `admin`
   - ✅ Check **"Auto Confirm User"**
   - Click **"Create User"**

3. **Create Teacher Account:**
   - Click **"Add User"** again
   - Email: `teacher@demo.com`
   - Password: `school`
   - ✅ Check **"Auto Confirm User"**
   - Click **"Create User"**

4. **Test Login:**
   - Go to your app
   - Login with: `admin@demo.com` / `admin`
   - Or: `teacher@demo.com` / `school`

### Option 2: Using Automated Script

1. **Get Service Role Key:**
   ```
   Go to Supabase Dashboard → Settings → API
   Copy "service_role" key (the secret one, NOT anon public)
   ```

2. **Create .env file:**
   ```bash
   # In project root
   echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" > .env.local
   ```

3. **Run setup script:**
   ```bash
   npm install dotenv
   node scripts/create-demo-accounts.mjs
   ```

## Login Credentials After Setup

| Role    | Email              | Password |
|---------|-------------------|----------|
| Admin   | admin@demo.com    | admin    |
| Teacher | teacher@demo.com  | school   |
| Student | IIS-2024-001      | 12345    |

## Why This Happens

- Students use custom PIN authentication (stored in database)
- Teachers/Admins use Supabase Auth (email/password)
- Seed data creates database records but not Auth accounts
- Auth accounts must be created separately

## Next Steps

After creating accounts:
1. Login as admin to access full dashboard
2. Login as teacher to create exams
3. Test complete workflow
