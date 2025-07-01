/*
  # Create avatars storage bucket with proper permissions

  1. New Storage
    - Creates 'avatars' bucket for user profile photos
    - Sets 5MB file size limit
    - Restricts to image file types only
    - Makes bucket publicly readable

  2. Security
    - Uses Supabase storage API functions to create bucket and policies
    - Ensures users can only manage their own avatars
    - Allows public read access to all avatars
*/

-- Create the avatars bucket using Supabase's storage API
BEGIN;

-- Create the bucket
SELECT storage.create_bucket('avatars');

-- Update bucket configuration
UPDATE storage.buckets 
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
WHERE id = 'avatars';

-- Create policies using Supabase's storage API functions
-- Policy for users to upload their own avatars
SELECT storage.create_policy(
  'avatars',
  'upload',
  'authenticated',
  bucket_id = 'avatars' AND auth.uid()::text = substring(name from '^([^/]+)/'));

-- Policy for users to update their own avatars
SELECT storage.create_policy(
  'avatars',
  'update',
  'authenticated',
  bucket_id = 'avatars' AND auth.uid()::text = substring(name from '^([^/]+)/'));

-- Policy for users to delete their own avatars
SELECT storage.create_policy(
  'avatars',
  'delete',
  'authenticated',
  bucket_id = 'avatars' AND auth.uid()::text = substring(name from '^([^/]+)/'));

-- Policy for public read access to all avatars
SELECT storage.create_policy(
  'avatars',
  'read',
  'public',
  bucket_id = 'avatars');

COMMIT;