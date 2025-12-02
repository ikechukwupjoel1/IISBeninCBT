-- Migration: Update exams table to support exam types and IP whitelisting
-- This enables practice mode, exam mode, and IP-based access control

-- Add new columns for exam configuration
ALTER TABLE exams
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'EXAM' CHECK (type IN ('EXAM', 'PRACTICE')),
ADD COLUMN IF NOT EXISTS allowed_ips JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS show_feedback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1;

-- Add comments to document the schema
COMMENT ON COLUMN exams.type IS 'Type of exam: EXAM (formal) or PRACTICE (unlimited attempts)';
COMMENT ON COLUMN exams.allowed_ips IS 'Array of allowed IP addresses for exam access (empty = no restriction)';
COMMENT ON COLUMN exams.show_feedback IS 'Whether to show correct answers after submission';
COMMENT ON COLUMN exams.max_attempts IS 'Maximum number of attempts allowed (for practice mode)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_exams_type ON exams(type);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
