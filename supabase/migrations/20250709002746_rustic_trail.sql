/*
  # Add subscription_id to stripe_checkout_sessions

  1. New Columns
    - Add `subscription_id` column to `stripe_checkout_sessions` table
  
  2. Changes
    - Adds missing column needed for webhook processing
*/

-- Add subscription_id column to stripe_checkout_sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_checkout_sessions' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE stripe_checkout_sessions ADD COLUMN subscription_id text;
  END IF;
END $$;