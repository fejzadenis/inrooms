/*
  # Fix Stripe Checkout Sessions Table

  1. New Tables
    - None (fixes existing table)
  
  2. Changes
    - Drops existing policies for stripe_checkout_sessions if they exist
    - Creates new policies with proper checks
    - Ensures indexes exist
  
  3. Security
    - Maintains RLS on stripe_checkout_sessions
    - Recreates policies for admins and users
*/

-- Create stripe_checkout_sessions table if it doesn't exist
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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all checkout sessions" ON stripe_checkout_sessions;
DROP POLICY IF EXISTS "Users can view their own checkout sessions" ON stripe_checkout_sessions;

-- Create policies with proper checks
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

CREATE POLICY "Users can view their own checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create indexes for checkout sessions
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_user_id_idx ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_customer_id_idx ON stripe_checkout_sessions(customer_id);
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_status_idx ON stripe_checkout_sessions(status);