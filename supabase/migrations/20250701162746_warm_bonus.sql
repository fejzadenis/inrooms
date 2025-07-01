/*
  # Setup Avatar Storage with Proper RLS Policies

  1. Changes
    - Create 'avatars' storage bucket for user profile photos
    - Configure appropriate security policies for the bucket
    - Allow users to upload/manage only their own avatars
    - Allow public read access to all avatars

  2. Security
    - Uses Supabase storage admin functions to create policies
    - Ensures users can only access their own files
    - Provides public read access for avatar display
*/

-- Create the avatars bucket using the storage admin function
SELECT storage.create_bucket('avatars', 'User profile photos', 'public');

-- Create policies using storage admin functions
-- Policy: Allow authenticated users to upload files to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow authenticated users to upload their own avatar'
  ) THEN
    SELECT storage.create_policy(
      'avatars',
      'Allow authenticated users to upload their own avatar',
      'INSERT',
      'authenticated',
      storage.foldername(name)[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Allow authenticated users to update their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow authenticated users to update their own avatar'
  ) THEN
    SELECT storage.create_policy(
      'avatars',
      'Allow authenticated users to update their own avatar',
      'UPDATE',
      'authenticated',
      storage.foldername(name)[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Allow authenticated users to delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow authenticated users to delete their own avatar'
  ) THEN
    SELECT storage.create_policy(
      'avatars',
      'Allow authenticated users to delete their own avatar',
      'DELETE',
      'authenticated',
      storage.foldername(name)[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Allow public read access to all avatar files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE name = 'Allow public read access to avatars'
  ) THEN
    SELECT storage.create_policy(
      'avatars',
      'Allow public read access to avatars',
      'SELECT',
      'public',
      true
    );
  END IF;
END $$;