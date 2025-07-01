/*
  # Create Avatar Storage

  1. Storage Setup
    - Create `avatars` storage bucket for user profile pictures
    - Enable public access for avatar viewing
    - Set file size limits and allowed file types

  2. Security Policies
    - Users can upload their own avatars
    - Anyone can view avatars (public read access)
    - Users can update/delete their own avatars
    - File type restrictions (images only)
    - File size limits

  3. Helper Functions
    - Function to generate avatar file paths
    - Function to clean up old avatars when new ones are uploaded
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatar"
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

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to generate avatar file path
CREATE OR REPLACE FUNCTION generate_avatar_path(user_id uuid, file_extension text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN user_id::text || '/avatar.' || file_extension;
END;
$$;

-- Function to clean up old avatars when uploading new ones
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_folder text;
BEGIN
  -- Extract user folder from the new file path
  user_folder := (storage.foldername(NEW.name))[1];
  
  -- Delete any existing avatar files for this user (except the new one)
  DELETE FROM storage.objects 
  WHERE bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = user_folder
    AND name != NEW.name;
    
  RETURN NEW;
END;
$$;

-- Trigger to cleanup old avatars on new upload
DROP TRIGGER IF EXISTS cleanup_old_avatar_trigger ON storage.objects;
CREATE TRIGGER cleanup_old_avatar_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION cleanup_old_avatar();

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

-- Function to get public avatar URL
CREATE OR REPLACE FUNCTION get_avatar_url(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avatar_path text;
  public_url text;
BEGIN
  -- Find the user's avatar file
  SELECT name INTO avatar_path
  FROM storage.objects
  WHERE bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = user_id::text
  LIMIT 1;
  
  IF avatar_path IS NOT NULL THEN
    -- Return the public URL for the avatar
    RETURN 'https://your-project.supabase.co/storage/v1/object/public/avatars/' || avatar_path;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;