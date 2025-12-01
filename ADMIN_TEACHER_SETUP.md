# FINAL FIX: Admin & Teacher Login

## The Issue
Admin and teacher login requires Supabase Auth accounts. You need to create them manually.

## Solution (5 minutes):

### Go to Supabase Dashboard
**Link:** https://supabase.com/dashboard/project/kbetovvbispxqafanmdv/auth/users

### Click "Add User" (green button, top right)

### Create Account #1 - Admin
```
Email: admin@demo.com
Password: admin
✅ Auto Confirm User: CHECK THIS BOX!
```
Click "Create User"

### Create Account #2 - Teacher  
Click "Add User" again
```
Email: teacher@demo.com
Password: school
✅ Auto Confirm User: CHECK THIS BOX!
```
Click "Create User"

## That's All!

Now test in your app:
- **Admin:** `admin@demo.com` / `admin` ✅
- **Teacher:** `teacher@demo.com` / `school` ✅
- **Student:** `IIS-2024-001` / `12345` ✅ (already works)

---

## Why This is Needed

| Role | Authentication Method |
|------|----------------------|
| Student | PIN in database (custom auth) |
| Teacher | Supabase Auth (email/password) |
| Admin | Supabase Auth (email/password) |

Students don't need Supabase Auth accounts - they use the custom PIN system.
Teachers/Admins MUST have Supabase Auth accounts created in the dashboard.

## Screenshot Guide
1. Dashboard → Authentication (left sidebar)
2. Users tab
3. "Add User" button
4. Fill form + **check "Auto Confirm User"**
5. Create User
6. Repeat for second account

The **"Auto Confirm User"** checkbox is critical - it bypasses email verification!
