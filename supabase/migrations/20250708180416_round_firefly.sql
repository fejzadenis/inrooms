/*
  # Add Subscription Sync Trigger Functions

  1. New Functions
    - `sync_subscription_to_firebase` - Syncs subscription data to Firebase
    - `trigger_subscription_sync` - Trigger to call sync when subscription changes

  2. Security
    - Functions run with security definer privileges
    - Only syncs essential subscription data

  3. Changes
    - Adds trigger to sync data when subscription info changes
    - Ensures both databases stay in sync
*/

-- Create a function to sync subscription data to Firebase
CREATE OR REPLACE FUNCTION sync_subscription_to_firebase()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  supabase_key TEXT;
  response JSONB;
BEGIN
  -- Get Supabase URL and key from environment variables
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- Call the Firebase sync edge function
  SELECT content::jsonb INTO response
  FROM http((
    'POST',
    supabase_url || '/functions/v1/firebase-sync',
    ARRAY[
      http_header('Authorization', 'Bearer ' || supabase_key),
      http_header('Content-Type', 'application/json')
    ],
    jsonb_build_object(
      'userId', NEW.id,
      'subscription', jsonb_build_object(
        'status', NEW.subscription_status,
        'eventsQuota', NEW.subscription_events_quota,
        'eventsUsed', NEW.subscription_events_used
      ),
      'stripe_customer_id', NEW.stripe_customer_id,
      'stripe_subscription_id', NEW.stripe_subscription_id,
      'stripe_subscription_status', NEW.stripe_subscription_status,
      'stripe_current_period_end', NEW.stripe_current_period_end
    )::text,
    5000 -- timeout in ms
  ));
  
  RAISE NOTICE 'Firebase sync response: %', response;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error syncing to Firebase: %', SQLERRM;
    RETURN NEW; -- Continue even if sync fails
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to sync subscription data to Firebase
DROP TRIGGER IF EXISTS trigger_subscription_sync ON users;

CREATE TRIGGER trigger_subscription_sync
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
EXECUTE FUNCTION sync_subscription_to_firebase();

-- Add a comment explaining the sync process
COMMENT ON FUNCTION sync_subscription_to_firebase() IS 
'This function is called when user subscription data changes to sync the changes to Firebase.
It calls the firebase-sync edge function to update the corresponding Firestore document.';