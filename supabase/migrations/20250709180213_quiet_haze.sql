/*
  # Add Admin Verification and Subscription Functions

  1. New Functions
    - `auto_verify_admin_emails` - Automatically verifies admin emails
    - `update_event_registration` - Updates event participants and user quota when registering
    - `get_user_subscription` - Retrieves user subscription data efficiently

  2. Triggers
    - Add trigger to automatically verify admin emails
    - Add trigger to update event registration counts

  3. Changes
    - Add index on users.id for better performance
    - Ensure proper constraints for subscription_status
*/

-- Add index on users.id if it doesn't exist
CREATE INDEX IF NOT EXISTS users_id_idx ON users(id);

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

-- Create a function to get user subscription data
CREATE OR REPLACE FUNCTION get_user_subscription(user_id TEXT)
RETURNS TABLE (
  subscription_status TEXT,
  subscription_events_quota INTEGER,
  subscription_events_used INTEGER,
  subscription_trial_ends_at TIMESTAMPTZ,
  stripe_subscription_status TEXT,
  stripe_current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.subscription_status,
    u.subscription_events_quota,
    u.subscription_events_used,
    u.subscription_trial_ends_at,
    u.stripe_subscription_status,
    u.stripe_current_period_end
  FROM 
    users u
  WHERE 
    u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Ensure subscription_status has proper constraints if not already set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_subscription_status_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_subscription_status_check 
    CHECK (subscription_status = ANY (ARRAY['trial', 'active', 'inactive']));
  END IF;
END $$;

-- Add default values for subscription fields if they don't exist
DO $$
BEGIN
  -- Check if columns exist and add defaults if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_status' AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE users 
    ALTER COLUMN subscription_status SET DEFAULT 'inactive';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_events_quota'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_events_quota' AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE users 
    ALTER COLUMN subscription_events_quota SET DEFAULT 0;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_events_used'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subscription_events_used' AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE users 
    ALTER COLUMN subscription_events_used SET DEFAULT 0;
  END IF;
END $$;