# Supabase Storage Setup

## Step 1: Create Storage Bucket

Run this SQL in your Supabase SQL Editor:

```sql
-- Create a storage bucket for exam images
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-images', 'exam-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for exam-images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'exam-images' );

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exam-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'exam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'exam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 2: Configure CORS (if needed)

If you encounter CORS issues, add your domain to the allowed origins in Supabase Dashboard:
- Go to Settings → API
- Add your Vercel domain to "CORS Allowed Origins"

## Step 3: Get Storage URL

Your storage URL will be:
```
https://[your-project-ref].supabase.co/storage/v1/object/public/exam-images/
```

Replace `[your-project-ref]` with your actual Supabase project reference.

## Folder Structure

Images will be organized as:
```
exam-images/
  ├── questions/
  │   └── [question-id]/
  │       └── image.jpg
  └── options/
      └── [question-id]/
          ├── option-0.jpg
          ├── option-1.jpg
          └── ...
```
