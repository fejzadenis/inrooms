/*
# Add Stripe columns to users table

1. New Columns
  - Add stripe_customer_id, stripe_subscription_id, and stripe_subscription_status columns to users table
  - These columns are needed for proper Stripe integration

2. Security
  - Maintain existing RLS policies
*/

-- Add Stripe columns to users table if they don't exist
DO $$
BEGIN
  -- Add stripe_customer_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;

  -- Add stripe_subscription_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
  END IF;

  -- Add stripe_subscription_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_subscription_status'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_subscription_status TEXT;
  END IF;

  -- Add stripe_current_period_end column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stripe_current_period_end'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_current_period_end TIMESTAMPTZ;
  END IF;
END
$$;