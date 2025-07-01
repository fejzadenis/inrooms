/*
  # Setup Avatar Storage Bucket and Policies

  1. Storage Setup
    - Create 'avatars' storage bucket if it doesn't exist
    - Configure bucket to be public for reading
    
  2. Security Policies
    - Allow authenticated users to upload files to their own folder
    - Allow authenticated users to update their own files
    - Allow authenticated users to delete their own files
    - Allow public read access to all avatar files
    
  3. Folder Structure
    - Files are organized by user ID: {user_id}/{filename}
    - Users can only manage files in their own folder
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access to all avatar files
CREATE POLICY "Allow public read access to avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');