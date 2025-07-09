/*
  # Fix Ambiguous Column References in Webhook Functions

  1. Changes
    - Rename local variables in functions to avoid ambiguity with table columns
    - Fix `subscription_status` ambiguity in update_user_from_checkout_session
    - Fix `subscription_status` ambiguity in update_user_subscription_from_stripe
    - Fix `subscription_status` ambiguity in handle_subscription_cancellation

  2. Security
    - No changes to security model
    - Maintains existing RLS policies
*/

-- Fix update_user_from_checkout_session function
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
      WHEN price_id LIKE '%starter%' THEN events_quota := 3;
      WHEN price_id LIKE '%professional%' THEN events_quota := 8;
      WHEN price_id LIKE '%enterprise%' THEN events_quota := 15;
      WHEN price_id LIKE '%team%' THEN events_quota := 10;
      ELSE events_quota := 0;
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

-- Fix update_user_subscription_from_stripe function
CREATE OR REPLACE FUNCTION update_user_subscription_from_stripe()
RETURNS TRIGGER AS $$
DECLARE
  events_quota INTEGER;
  _subscription_status TEXT;  -- Renamed to avoid ambiguity
BEGIN
  -- Determine events quota based on price ID
  CASE
    WHEN NEW.price_id LIKE '%starter%' THEN events_quota := 3;
    WHEN NEW.price_id LIKE '%professional%' THEN events_quota := 8;
    WHEN NEW.price_id LIKE '%enterprise%' THEN events_quota := 15;
    WHEN NEW.price_id LIKE '%team%' THEN events_quota := 10;
    ELSE events_quota := 0;
  END CASE;

  -- Determine subscription status
  IF NEW.status = 'active' THEN
    _subscription_status := 'active';  -- Use renamed variable
  ELSIF NEW.status = 'trialing' THEN
    _subscription_status := 'trial';  -- Use renamed variable
  ELSE
    _subscription_status := 'inactive';  -- Use renamed variable
  END IF;

  -- Update the user record with subscription information
  UPDATE users
  SET 
    stripe_subscription_id = NEW.id,
    stripe_subscription_status = NEW.status,
    stripe_current_period_end = NEW.current_period_end,
    subscription_status = _subscription_status,  -- Use renamed variable
    subscription_events_quota = events_quota,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix handle_subscription_cancellation function
CREATE OR REPLACE FUNCTION handle_subscription_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to canceled
  IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
    -- Update the user record
    UPDATE users
    SET 
      subscription_status = 'inactive',
      stripe_subscription_status = 'canceled',
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;