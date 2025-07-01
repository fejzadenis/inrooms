/*
  # Create avatars storage bucket and policies

  1. New Storage
    - Create 'avatars' bucket for user profile photos
    - Set bucket to public for read access

  2. Security
    - Create storage bucket with appropriate permissions
    - Use Supabase's storage administration functions
*/

-- Create the avatars bucket if it doesn't exist
SELECT storage.create_bucket('avatars', 'User profile photos');

-- Set the bucket to public
UPDATE storage.buckets SET public = TRUE WHERE id = 'avatars';

-- Create policy for users to upload their own avatars
SELECT storage.create_policy(
  'avatars',
  'upload',
  'authenticated',
  storage.foldername(name) = auth.uid()::text
);

-- Create policy for users to update their own avatars
SELECT storage.create_policy(
  'avatars',
  'update',
  'authenticated',
  storage.foldername(name) = auth.uid()::text
);

-- Create policy for users to delete their own avatars
SELECT storage.create_policy(
  'avatars',
  'delete',
  'authenticated',
  storage.foldername(name) = auth.uid()::text
);

-- Create policy for public read access to avatars
SELECT storage.create_policy(
  'avatars',
  'select',
  'public',
  true
);