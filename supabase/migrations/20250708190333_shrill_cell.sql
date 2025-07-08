/*
  # Update Checkout Session Trigger

  1. Changes
    - Improve the update_user_from_checkout_session function
    - Add support for updating subscription details from checkout session
    - Add trigger to update subscription data when checkout session completes

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data synchronization between systems
*/

-- Create or replace function to update user data when a checkout session is completed
CREATE OR REPLACE FUNCTION update_user_from_checkout_session()
RETURNS TRIGGER AS $$
DECLARE
  events_quota INTEGER := 0;
  subscription_status TEXT := 'inactive';
  price_id TEXT;
BEGIN
  -- Only process when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get price ID from the checkout session
    price_id := NEW.price_id;
    
    -- Determine events quota based on price ID
    CASE
      WHEN price_id LIKE '%starter%' THEN events_quota := 3;
      WHEN price_id LIKE '%professional%' THEN events_quota := 8;
      WHEN price_id LIKE '%enterprise%' THEN events_quota := 15;
      WHEN price_id LIKE '%team%' THEN events_quota := 10;
      ELSE events_quota := 0;
    END CASE;
    
    -- Set subscription status to active if we have a subscription
    IF NEW.subscription_id IS NOT NULL THEN
      subscription_status := 'active';
    END IF;
    
    -- Update the user record
    UPDATE users
    SET 
      stripe_customer_id = NEW.customer_id,
      stripe_subscription_id = NEW.subscription_id,
      stripe_subscription_status = CASE WHEN NEW.subscription_id IS NOT NULL THEN 'active' ELSE NULL END,
      subscription_status = subscription_status,
      subscription_events_quota = events_quota,
      subscription_events_used = 0,
      updated_at = NOW(),
      needs_firebase_sync = true,
      firebase_sync_requested_at = NOW()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Updated user % with checkout session data', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_from_checkout_trigger ON stripe_checkout_sessions;

-- Create trigger to update user data when a checkout session is completed
CREATE TRIGGER update_user_from_checkout_trigger
AFTER UPDATE ON stripe_checkout_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_from_checkout_session();