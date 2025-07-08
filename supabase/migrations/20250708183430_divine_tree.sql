/*
  # Create Sync Trigger for Firestore Integration

  1. New Features
    - Add needs_firebase_sync column to users table
    - Create trigger to mark users for Firebase sync when subscription data changes
    - Add firebase_sync_requested_at timestamp for tracking

  2. Security
    - Maintain existing RLS policies
    - No direct calls to external services from database triggers
*/

-- Add needs_firebase_sync column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'needs_firebase_sync'
  ) THEN
    ALTER TABLE users ADD COLUMN needs_firebase_sync BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'firebase_sync_requested_at'
  ) THEN
    ALTER TABLE users ADD COLUMN firebase_sync_requested_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create a function to mark subscription data for Firebase sync
CREATE OR REPLACE FUNCTION trigger_firebase_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Set a flag to indicate this record needs syncing
  -- This avoids making HTTP calls directly from the trigger
  
  -- Update the user record with a needs_sync flag
  UPDATE users
  SET 
    needs_firebase_sync = true,
    firebase_sync_requested_at = now()
  WHERE id = NEW.id;
  
  RAISE NOTICE 'User % marked for Firebase sync', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to detect subscription data changes
DROP TRIGGER IF EXISTS trigger_firebase_sync ON users;

CREATE TRIGGER trigger_firebase_sync
AFTER UPDATE OF subscription_status, subscription_events_quota, subscription_events_used, 
  stripe_subscription_id, stripe_subscription_status, stripe_current_period_end
ON users
FOR EACH ROW
WHEN (
  NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
  NEW.subscription_events_quota IS DISTINCT FROM OLD.subscription_events_quota OR
  NEW.subscription_events_used IS DISTINCT FROM OLD.subscription_events_used OR
  NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id OR
  NEW.stripe_subscription_status IS DISTINCT FROM OLD.stripe_subscription_status OR
  NEW.stripe_current_period_end IS DISTINCT FROM OLD.stripe_current_period_end
)
EXECUTE FUNCTION trigger_firebase_sync();

-- Add a comment explaining the sync process
COMMENT ON FUNCTION trigger_firebase_sync() IS 
'This function is called when user subscription data changes to sync the changes to Firebase.
In a production environment, this would call an edge function with Firebase Admin SDK credentials
to update the corresponding Firestore document.';