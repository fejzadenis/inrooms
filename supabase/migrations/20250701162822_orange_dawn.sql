/*
  # Fix Storage Policies for Avatar Uploads

  1. Changes
    - Create or update the avatars bucket
    - Use Supabase's storage administration functions to create policies
    - Check if policies exist before creating them to avoid conflicts
    - Ensure proper permissions for user avatar uploads

  2. Security
    - Allow users to upload/update/delete only their own avatars
    - Allow public read access to all avatars
*/

-- Create or update the avatars bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];
END $$;

-- Create policies using DO blocks to avoid errors if they already exist
DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload their own avatars'
  ) THEN
    -- Create policy for users to upload their own avatars
    CREATE POLICY "Users can upload their own avatars"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    );
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own avatars'
  ) THEN
    -- Create policy for users to update their own avatars
    CREATE POLICY "Users can update their own avatars"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    );
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own avatars'
  ) THEN
    -- Create policy for users to delete their own avatars
    CREATE POLICY "Users can delete their own avatars"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    );
  END IF;
END $$;

DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can view avatars'
  ) THEN
    -- Create policy for public read access to all avatars
    CREATE POLICY "Public can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;
END $$;