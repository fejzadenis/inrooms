/*
  # Create avatars storage bucket for user profile photos
  
  1. New Storage Bucket
    - Create 'avatars' bucket for storing user profile photos
    - Set 5MB file size limit
    - Allow only image file types
    - Make bucket publicly readable
  
  2. Security
    - Create policies to ensure users can only manage their own avatars
    - Allow public read access to all avatars
*/

-- Create the avatars bucket directly in the storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'User profile photos', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Create policies directly on the storage.objects table
-- Policy for users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Policy for users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Policy for users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = SPLIT_PART(name, '/', 1)
);

-- Policy for public read access to all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');