-- Create the avatars bucket if it doesn't exist
BEGIN;

-- Create the bucket using the storage API
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping bucket creation due to permissions';
END $$;

-- Create policies using the storage API
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) INTO bucket_exists;

  IF bucket_exists THEN
    -- Create upload policy
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can upload their own avatars',
      '{"bucket_id":"avatars","owner":"authenticated","check":{"bucket_id":"avatars","folder":"${auth.uid()}/"}}',
      'avatars'
    )
    ON CONFLICT (name, bucket_id) DO NOTHING;

    -- Create update policy
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can update their own avatars',
      '{"bucket_id":"avatars","owner":"authenticated","check":{"bucket_id":"avatars","folder":"${auth.uid()}/"},"match":{"bucket_id":"avatars","folder":"${auth.uid()}/"}}',
      'avatars'
    )
    ON CONFLICT (name, bucket_id) DO NOTHING;

    -- Create delete policy
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can delete their own avatars',
      '{"bucket_id":"avatars","owner":"authenticated","match":{"bucket_id":"avatars","folder":"${auth.uid()}/"}}',
      'avatars'
    )
    ON CONFLICT (name, bucket_id) DO NOTHING;

    -- Create read policy
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Anyone can view avatars',
      '{"bucket_id":"avatars","owner":"public","match":{"bucket_id":"avatars"}}',
      'avatars'
    )
    ON CONFLICT (name, bucket_id) DO NOTHING;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping policy creation due to permissions';
END $$;

COMMIT;