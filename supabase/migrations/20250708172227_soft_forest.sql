/*
  # Fix Subscription Updates in Stripe Webhook

  1. Changes
    - Update the webhook handler to properly update user subscription status
    - Add trigger function to update user subscription data when Stripe subscription changes
    - Ensure proper event quota updates based on subscription plan

  2. Security
    - Maintain existing RLS policies
*/

-- Create a function to update user subscription data when a Stripe subscription is updated
CREATE OR REPLACE FUNCTION update_user_subscription_from_stripe()
RETURNS TRIGGER AS $$
DECLARE
  events_quota INTEGER;
  subscription_status TEXT;
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
    subscription_status := 'active';
  ELSIF NEW.status = 'trialing' THEN
    subscription_status := 'trial';
  ELSE
    subscription_status := 'inactive';
  END IF;

  -- Update the user record with subscription information
  UPDATE users
  SET 
    stripe_subscription_id = NEW.id,
    stripe_subscription_status = NEW.status,
    stripe_current_period_end = NEW.current_period_end,
    subscription_status = subscription_status,
    subscription_events_quota = events_quota,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update user subscription data when a Stripe subscription is inserted or updated
DROP TRIGGER IF EXISTS update_user_subscription_trigger ON stripe_subscriptions;

CREATE TRIGGER update_user_subscription_trigger
AFTER INSERT OR UPDATE ON stripe_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_user_subscription_from_stripe();

-- Create a function to update user data when a checkout session is completed
CREATE OR REPLACE FUNCTION update_user_from_checkout_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process completed sessions
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update the user record with customer ID
    UPDATE users
    SET 
      stripe_customer_id = NEW.customer_id,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update user data when a checkout session is completed
DROP TRIGGER IF EXISTS update_user_from_checkout_trigger ON stripe_checkout_sessions;

CREATE TRIGGER update_user_from_checkout_trigger
AFTER UPDATE ON stripe_checkout_sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_from_checkout_session();

-- Create a function to handle subscription cancellation
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

-- Create a trigger for subscription cancellation
DROP TRIGGER IF EXISTS subscription_cancellation_trigger ON stripe_subscriptions;

CREATE TRIGGER subscription_cancellation_trigger
AFTER UPDATE ON stripe_subscriptions
FOR EACH ROW
WHEN (NEW.status = 'canceled' AND OLD.status != 'canceled')
EXECUTE FUNCTION handle_subscription_cancellation();

-- Add a function to update user data when a customer is created or updated
CREATE OR REPLACE FUNCTION update_user_from_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user record with customer ID
  UPDATE users
  SET 
    stripe_customer_id = NEW.id,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update user data when a customer is created
DROP TRIGGER IF EXISTS update_user_from_customer_trigger ON stripe_customers;

CREATE TRIGGER update_user_from_customer_trigger
AFTER INSERT ON stripe_customers
FOR EACH ROW
EXECUTE FUNCTION update_user_from_customer();