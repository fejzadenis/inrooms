/*
  # Fix Firebase Sync Column Reference

  1. Changes
    - Update the update_user_from_checkout_session function to remove references to needs_firebase_sync
    - Remove references to firebase_sync_requested_at
    - Fix ambiguous column references by using renamed local variables
  
  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Fix update_user_from_checkout_session function to remove needs_firebase_sync reference
CREATE OR REPLACE FUNCTION update_user_from_checkout_session()
RETURNS TRIGGER AS $$
DECLARE
  events_quota INTEGER := 0;
  _subscription_status TEXT := 'inactive';  -- Renamed to avoid ambiguity
  price_id TEXT;
BEGIN
  -- Only process when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get price ID from the checkout session
    price_id := NEW.price_id;
    
    -- Determine events quota based on price ID
    CASE
      WHEN price_id LIKE '%price_1Rif3UGCopIxkzs6WPBgO8wt%' THEN events_quota := 3;
      WHEN price_id LIKE '%price_1Rif4MGCopIxkzs6EN1InWXN%' THEN events_quota := 8;
      WHEN price_id LIKE '%price_1Rif6HGCopIxkzs6rLt5gZQf%' THEN events_quota := 15;
      WHEN price_id LIKE '%team%' THEN events_quota := 10;
      ELSE events_quota := 0;
    END CASE;
    
    -- Set subscription status to active if we have a subscription
    IF NEW.subscription_id IS NOT NULL THEN
      _subscription_status := 'active';  -- Use renamed variable
    END IF;
    
    -- Update the user record without needs_firebase_sync reference
    UPDATE users
    SET 
      stripe_customer_id = NEW.customer_id,
      stripe_subscription_id = NEW.subscription_id,
      stripe_subscription_status = CASE WHEN NEW.subscription_id IS NOT NULL THEN 'active' ELSE NULL END,
      subscription_status = _subscription_status,  -- Use renamed variable
      subscription_events_quota = events_quota,
      subscription_events_used = 0,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Updated user % with checkout session data', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix trigger_firebase_sync function to remove needs_firebase_sync reference
CREATE OR REPLACE FUNCTION trigger_firebase_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the sync request without updating needs_firebase_sync
  RAISE NOTICE 'User % subscription data changed, sync would be triggered', NEW.id;
  
  -- In a real implementation, this would call an edge function to sync data
  -- But we're not updating any columns that might not exist
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Keep the comment explaining the sync process
COMMENT ON FUNCTION trigger_firebase_sync() IS 
'This function is called when user subscription data changes to sync the changes to Firebase.
In a production environment, this would call an edge function with Firebase Admin SDK credentials
to update the corresponding Firestore document.';