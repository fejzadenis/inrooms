/*
  # Create avatar storage system

  1. New Features
    - Creates an avatars storage bucket for user profile pictures
    - Adds avatar_url column to users table
    - Creates helper functions for avatar management

  2. Security
    - Public read access for avatars
    - Users can only manage their own avatars
*/

-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Add avatar_url column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Function to generate avatar file path
CREATE OR REPLACE FUNCTION public.generate_avatar_path(user_id text, file_extension text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN user_id || '/avatar.' || file_extension;
END;
$$;

-- Function to get public avatar URL
CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_url text;
  project_ref text;
BEGIN
  -- Get the project reference from the current database
  SELECT current_setting('request.headers')::json->>'x-forwarded-host' INTO project_ref;
  
  -- Construct the base URL
  base_url := 'https://' || project_ref || '/storage/v1/object/public/avatars/';
  
  -- Return the complete URL
  RETURN base_url || user_id || '/avatar';
END;
$$;

-- Note: Storage policies must be created through the Supabase dashboard
-- or using the Supabase Management API, as they require special permissions.
-- Please set up the following policies manually:
--
-- 1. Allow users to upload files to their own folder:
--    - Table: storage.objects
--    - Operation: INSERT
--    - Role: authenticated
--    - Policy definition: bucket_id = 'avatars' AND auth.uid()::text = storage.foldername(name)[1]
--
-- 2. Allow users to update their own files:
--    - Table: storage.objects
--    - Operation: UPDATE
--    - Role: authenticated
--    - Policy definition: bucket_id = 'avatars' AND auth.uid()::text = storage.foldername(name)[1]
--
-- 3. Allow users to delete their own files:
--    - Table: storage.objects
--    - Operation: DELETE
--    - Role: authenticated
--    - Policy definition: bucket_id = 'avatars' AND auth.uid()::text = storage.foldername(name)[1]
--
-- 4. Allow public read access to avatars:
--    - Table: storage.objects
--    - Operation: SELECT
--    - Role: public
--    - Policy definition: bucket_id = 'avatars'