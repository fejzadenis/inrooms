/*
  # Fix Checkout Sessions Table

  1. New Tables
    - Ensures `stripe_checkout_sessions` table exists
  2. Security
    - Enables RLS on the table
    - Adds policies for admins and users with existence checks
  3. Indexes
    - Creates indexes for efficient queries
*/

-- Create stripe_checkout_sessions table to track checkout sessions
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES stripe_customers(id) ON DELETE SET NULL,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  metadata JSONB,
  success_url TEXT,
  cancel_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on stripe_checkout_sessions
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_checkout_sessions with existence checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_checkout_sessions' 
    AND policyname = 'Admins can manage all checkout sessions'
  ) THEN
    CREATE POLICY "Admins can manage all checkout sessions"
      ON stripe_checkout_sessions
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()::text AND users.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_checkout_sessions' 
    AND policyname = 'Users can view their own checkout sessions'
  ) THEN
    CREATE POLICY "Users can view their own checkout sessions"
      ON stripe_checkout_sessions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- Create indexes for checkout sessions if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'stripe_checkout_sessions' 
    AND indexname = 'stripe_checkout_sessions_user_id_idx'
  ) THEN
    CREATE INDEX stripe_checkout_sessions_user_id_idx ON stripe_checkout_sessions(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'stripe_checkout_sessions' 
    AND indexname = 'stripe_checkout_sessions_customer_id_idx'
  ) THEN
    CREATE INDEX stripe_checkout_sessions_customer_id_idx ON stripe_checkout_sessions(customer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'stripe_checkout_sessions' 
    AND indexname = 'stripe_checkout_sessions_status_idx'
  ) THEN
    CREATE INDEX stripe_checkout_sessions_status_idx ON stripe_checkout_sessions(status);
  END IF;
END $$;