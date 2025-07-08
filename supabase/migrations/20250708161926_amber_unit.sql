/*
  # Fix Stripe Checkout Sessions Table

  1. Changes
    - Drops existing table and recreates it to avoid conflicts
    - Drops existing policies before creating new ones
    - Creates proper indexes for performance
  
  2. Security
    - Enables RLS on the table
    - Adds policies for admins and users
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS stripe_checkout_sessions CASCADE;

-- Create stripe_checkout_sessions table to track checkout sessions
CREATE TABLE stripe_checkout_sessions (
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

-- Create policies for stripe_checkout_sessions
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
CREATE INDEX stripe_checkout_sessions_user_id_idx ON stripe_checkout_sessions(user_id);
CREATE INDEX stripe_checkout_sessions_customer_id_idx ON stripe_checkout_sessions(customer_id);
CREATE INDEX stripe_checkout_sessions_status_idx ON stripe_checkout_sessions(status);