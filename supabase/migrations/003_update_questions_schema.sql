-- Migration: Update questions table to support advanced question types
-- This adds support for image-based questions, multi-select, and matching questions

-- Add new columns for advanced question types
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS option_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS matching_pairs JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the schema
COMMENT ON COLUMN questions.image_url IS 'URL of the question image (optional)';
COMMENT ON COLUMN questions.option_images IS 'Array of image URLs for options (optional)';
COMMENT ON COLUMN questions.matching_pairs IS 'Array of {left, right} pairs for matching questions';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
