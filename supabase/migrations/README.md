# Database Migrations

This directory contains SQL migration files for the IISBenin CBT application.

## Migration Files

1. **001_initial_schema.sql** - Initial database schema
2. **002_add_pin_hashing.sql** - PIN hashing security implementation
3. **003_update_questions_schema.sql** - Advanced question types support
4. **004_update_exams_schema.sql** - Exam types and IP whitelisting
5. **005_create_audit_logs.sql** - Audit logging system

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file (in order)
4. Paste and run each migration

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd c:\Users\owner\Downloads\iisbenin-cbt

# Run all pending migrations
supabase db push

# Or run a specific migration
supabase db execute --file supabase/migrations/003_update_questions_schema.sql
```

## Verification

After running migrations, verify the changes:

```sql
-- Check questions table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'questions';

-- Check exams table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exams';

-- Check audit_logs table exists
SELECT * FROM audit_logs LIMIT 1;
```

## Rollback

If you need to rollback a migration:

```sql
-- For questions table
ALTER TABLE questions 
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS option_images,
DROP COLUMN IF EXISTS matching_pairs;

-- For exams table
ALTER TABLE exams 
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS allowed_ips,
DROP COLUMN IF EXISTS show_feedback,
DROP COLUMN IF EXISTS max_attempts;

-- For audit_logs table
DROP TABLE IF EXISTS audit_logs CASCADE;
```

## Next Steps

After running these migrations:
1. Update `databaseService.ts` to handle new fields
2. Update TypeScript types to match new schema
3. Test CRUD operations with new fields
