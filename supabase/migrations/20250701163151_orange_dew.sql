/*
  # Create Storage Policies for Avatar Uploads

  1. Changes
    - Create the avatars bucket if it doesn't exist
    - Create storage policies for avatar uploads using Supabase's storage admin functions
    - Allow users to upload, update, and delete their own avatars
    - Allow public read access to all avatars

  2. Security
    - Ensures users can only manage their own avatar files
    - Provides public read access for avatar display
*/

-- Create the avatars bucket if it doesn't exist
BEGIN;
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO UPDATE SET
    public = true;
COMMIT;

-- Use Supabase's storage admin functions to create policies
-- These functions are provided by Supabase and have the necessary permissions

-- Policy: Users can upload files to their own folder
SELECT storage.create_policy(
  'avatars',
  'upload_avatar_policy',
  'INSERT',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Policy: Users can update their own avatar files
SELECT storage.create_policy(
  'avatars',
  'update_avatar_policy',
  'UPDATE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar files
SELECT storage.create_policy(
  'avatars',
  'delete_avatar_policy',
  'DELETE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Policy: Anyone can view avatar files (public read access)
SELECT storage.create_policy(
  'avatars',
  'read_avatar_policy',
  'SELECT',
  'public',
  true
);