/*
  # Fix Subscription Data Fetching

  1. Changes
    - Add index on users.id for faster lookups
    - Add helper function for fetching user subscription data
    - Ensure proper constraints on subscription_status
    - Add default values for subscription fields

  2. Security
    - Maintain existing RLS policies
*/

-- Add index on users.id if it doesn't exist
CREATE INDEX IF NOT EXISTS users_id_idx ON users(id);

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