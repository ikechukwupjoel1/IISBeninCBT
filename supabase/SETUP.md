# Supabase Setup Instructions

## Step 1: Run Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard/project/kbetovvbispxqafanmdv
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/schema.sql` and paste it into the editor
5. Click **Run** to execute the schema

This will create all tables, indexes, RLS policies, and initial halls.

## Step 2: Seed Demo Data

1. In the same SQL Editor, create another **New Query**
2. Copy the contents of `supabase/seed.sql` and paste it
3. Click **Run** to populate demo data

This will create:
- 1 Admin user
- 2 Teacher users
- 3 Student users
- 1 Demo exam with 5 questions
- Sample exam results

## Step 3: Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** section
3. Copy the following values:
   - **Project URL**: `https://kbetovvbispxqafanmdv.supabase.co`
   - **anon/public key**: Copy the `anon` `public` key

## Step 4: Configure Environment Variables

1. Create a file named `.env.local` in your project root
2. Add the following (replace with your actual keys):

```
VITE_SUPABASE_URL=https://kbetovvbispxqafanmdv.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key
```

## Step 5: Test Locally

```bash
npm run dev
```

## Demo Login Credentials

### Admin
- Email: `admin@iisbenin.edu`
- Password: (You'll need to set this up in Supabase Auth)

### Student
- Reg Number: `IIS-2024-001`
- PIN: `12345`

### Teacher
- Email: `rajesh.kumar@iisbenin.edu`
- Password: (You'll need to set this up in Supabase Auth)

## Step 6: Deploy to Vercel

1. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

2. Push your code:
```bash
git add .
git commit -m "Integrate Supabase backend"
git push
```

Vercel will automatically redeploy with the new backend!
