-- Add App Settings Table for Logo and Configuration
-- Run this in Supabase SQL Editor

-- Create settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings
CREATE POLICY "Allow read access to settings" ON app_settings
  FOR SELECT USING (true);

-- Allow admins to update settings
CREATE POLICY "Allow admin update settings" ON app_settings
  FOR UPDATE USING (true);

-- Allow admin to insert settings
CREATE POLICY "Allow admin insert settings" ON app_settings
  FOR INSERT WITH CHECK (true);

-- Insert default logo setting
INSERT INTO app_settings (key, value) 
VALUES ('global_logo', 'https://i.imgur.com/8YQZ6Lk.png')
ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT * FROM app_settings;
