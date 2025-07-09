/*
  # Fix Event Registration and Admin Email Verification

  1. New Features
    - Add trigger to update event registration counts in Supabase
    - Add trigger to reset event usage when subscription renews
    - Add special handling for admin users to bypass email verification

  2. Changes
    - Create update_event_registration function
    - Create reset_event_usage_on_renewal function
    - Update ProtectedRoute component to bypass email verification for admin users
*/

-- Create a function to update event registration in Supabase
CREATE OR REPLACE FUNCTION update_event_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the event's current participants count
  UPDATE events
  SET 
    current_participants = current_participants + 1,
    updated_at = NOW()
  WHERE id = NEW.event_id;
  
  -- Update the user's events_used count
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

-- Create a function to reset event usage when subscription renews
CREATE OR REPLACE FUNCTION reset_event_usage_on_renewal()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when period start changes (indicating a renewal)
  IF NEW.current_period_start <> OLD.current_period_start THEN
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
WHEN (NEW.current_period_start <> OLD.current_period_start)
EXECUTE FUNCTION reset_event_usage_on_renewal();

-- Create a function to automatically verify admin emails
CREATE OR REPLACE FUNCTION auto_verify_admin_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is an admin or has admin@inrooms.com email, automatically verify
  IF NEW.role = 'admin' OR NEW.email = 'admin@inrooms.com' THEN
    NEW.email_verified = TRUE;
    NEW.email_verified_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically verify admin emails
DROP TRIGGER IF EXISTS auto_verify_admin_emails_trigger ON users;

CREATE TRIGGER auto_verify_admin_emails_trigger
BEFORE INSERT OR UPDATE OF role, email ON users
FOR EACH ROW
EXECUTE FUNCTION auto_verify_admin_emails();