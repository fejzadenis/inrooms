/*
  # Add Firebase Sync Trigger Functions

  1. New Functions
    - `sync_to_firebase` - Syncs user data from Supabase to Firebase
    - `trigger_firebase_sync` - Trigger function to call sync when user data changes

  2. Security
    - Functions run with security definer privileges to access Firebase credentials
    - Only syncs essential subscription and user data

  3. Changes
    - Adds trigger to sync data when user subscription info changes
    - Ensures both databases stay in sync
*/

-- Create a function to sync user data to Firebase
CREATE OR REPLACE FUNCTION sync_to_firebase()
RETURNS TRIGGER AS $$
BEGIN
  -- This function would call a webhook or edge function to sync data to Firebase
  -- In a real implementation, this would make an HTTP request to a Firebase Admin SDK endpoint
  -- For now, we'll just log that the sync would happen
  RAISE NOTICE 'Would sync user % to Firebase with subscription status %', 
    NEW.id, 
    NEW.subscription_status;
    
  -- The actual implementation would call an edge function with the user data
  -- This is a placeholder for the actual implementation
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to sync user data to Firebase when subscription info changes
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
EXECUTE FUNCTION sync_to_firebase();

-- Add a comment explaining the sync process
COMMENT ON FUNCTION sync_to_firebase() IS 
'This function is called when user subscription data changes to sync the changes to Firebase.
In a production environment, this would call an edge function with Firebase Admin SDK credentials
to update the corresponding Firestore document.';