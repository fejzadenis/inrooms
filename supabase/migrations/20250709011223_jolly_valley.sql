/*
# Remove Firebase Sync Fields

This migration removes fields related to Firebase synchronization that are no longer needed
since we're directly updating Firebase from the webhook.

1. Changes
   - Remove needs_firebase_sync column from users table
   - Remove firebase_sync_requested_at column from users table

2. Rationale
   - We're now directly updating Firebase from the Stripe webhook
   - No need to track sync status in the database
*/

-- Remove Firebase sync fields from users table if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'needs_firebase_sync'
  ) THEN
    ALTER TABLE users DROP COLUMN needs_firebase_sync;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'firebase_sync_requested_at'
  ) THEN
    ALTER TABLE users DROP COLUMN firebase_sync_requested_at;
  END IF;
END $$;