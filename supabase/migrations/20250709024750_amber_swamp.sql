/*
  # Improve Supabase Integration for User Data

  1. Changes
    - Add function to sync event registrations with Supabase
    - Update user event quota tracking in Supabase
    - Fix ambiguous column references in all functions
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper data synchronization between systems
*/

-- Create a function to update event registration in Supabase
CREATE OR REPLACE FUNCTION update_event_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's events_used count in Supabase
  UPDATE users
  SET 
    subscription_events_used = subscription_events_used + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update event registration when a new registration is created
DROP TRIGGER IF EXISTS update_event_registration_trigger ON registrations;

CREATE TRIGGER update_event_registration_trigger
AFTER INSERT ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_event_registration();

-- Update the update_user_from_checkout_session function to be more specific with price IDs
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
    
    -- Determine events quota based on specific price IDs
    CASE
      WHEN price_id = 'price_1Rif3UGCopIxkzs6WPBgO8wt' THEN events_quota := 3; -- Starter
      WHEN price_id = 'price_1Rif4MGCopIxkzs6EN1InWXN' THEN events_quota := 8; -- Professional
      WHEN price_id = 'price_1Rif6HGCopIxkzs6rLt5gZQf' THEN events_quota := 15; -- Enterprise
      WHEN price_id LIKE '%team%' THEN events_quota := 10; -- Team
      ELSE 
        -- Try to determine by name pattern if exact match fails
        CASE
          WHEN price_id LIKE '%starter%' THEN events_quota := 3;
          WHEN price_id LIKE '%professional%' THEN events_quota := 8;
          WHEN price_id LIKE '%enterprise%' THEN events_quota := 15;
          ELSE events_quota := 0;
        END CASE;
    END CASE;
    
    -- Set subscription status to active if we have a subscription
    IF NEW.subscription_id IS NOT NULL THEN
      _subscription_status := 'active';  -- Use renamed variable
    END IF;
    
    -- Update the user record
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

-- Create a function to reset event usage when subscription renews
CREATE OR REPLACE FUNCTION reset_event_usage_on_renewal()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when period start changes (indicating a renewal)
  IF NEW.current_period_start != OLD.current_period_start THEN
    -- Reset the events used count
    UPDATE users
    SET 
      subscription_events_used = 0,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Reset event usage for user % on subscription renewal', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to reset event usage when subscription renews
DROP TRIGGER IF EXISTS reset_event_usage_trigger ON stripe_subscriptions;

CREATE TRIGGER reset_event_usage_trigger
AFTER UPDATE ON stripe_subscriptions
FOR EACH ROW
WHEN (NEW.current_period_start != OLD.current_period_start)
EXECUTE FUNCTION reset_event_usage_on_renewal();