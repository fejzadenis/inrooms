/*
  # Create avatars storage bucket with proper permissions

  1. New Storage
    - Create 'avatars' bucket for user profile photos
    - Set appropriate file size limits and MIME types
    - Make bucket publicly readable

  2. Security
    - Create policies for authenticated users to manage their own avatars
    - Allow public read access to all avatars
    - Ensure users can only access their own folders
*/

-- Create the avatars bucket with proper configuration
SELECT storage.create_bucket(
  'avatars',
  'User profile photos',
  public => true,
  file_size_limit => 5242880, -- 5MB
  allowed_mime_types => ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
);

-- Create policy for users to upload their own avatars (in their own folder)
SELECT storage.create_policy(
  'avatars',
  'upload_avatar',
  'INSERT',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy for users to update their own avatars
SELECT storage.create_policy(
  'avatars',
  'update_avatar',
  'UPDATE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy for users to delete their own avatars
SELECT storage.create_policy(
  'avatars',
  'delete_avatar',
  'DELETE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy for public read access to all avatars
SELECT storage.create_policy(
  'avatars',
  'read_avatar',
  'SELECT',
  'public',
  true
);