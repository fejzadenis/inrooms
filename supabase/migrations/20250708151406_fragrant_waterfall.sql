/*
  # Stripe Checkout Integration

  1. New Tables
    - `stripe_checkout_sessions` - Tracks checkout sessions with user information
    - Ensures `stripe_payment_methods` exists with proper structure

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure cascade deletion for related records

  3. Changes
    - Add metadata fields to existing tables
    - Create indexes for performance
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

-- Create policies for stripe_checkout_sessions
DROP POLICY IF EXISTS "Admins can manage all checkout sessions" ON stripe_checkout_sessions;
DROP POLICY IF EXISTS "Users can view their own checkout sessions" ON stripe_checkout_sessions;

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

-- Create stripe_payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_payment_methods (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on stripe_payment_methods
ALTER TABLE stripe_payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all payment methods" ON stripe_payment_methods;
DROP POLICY IF EXISTS "Users can view their own payment methods" ON stripe_payment_methods;

-- Create policies for stripe_payment_methods
CREATE POLICY "Admins can manage all payment methods"
  ON stripe_payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own payment methods"
  ON stripe_payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create indexes for stripe_payment_methods
CREATE INDEX IF NOT EXISTS stripe_payment_methods_customer_id_idx ON stripe_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS stripe_payment_methods_user_id_idx ON stripe_payment_methods(user_id);

-- Add metadata field to stripe_subscriptions if it doesn't exist
ALTER TABLE IF EXISTS stripe_subscriptions 
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add metadata field to stripe_customers if it doesn't exist
ALTER TABLE IF EXISTS stripe_customers 
  ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add default_payment_method field to stripe_customers if it doesn't exist
ALTER TABLE IF EXISTS stripe_customers 
  ADD COLUMN IF NOT EXISTS default_payment_method TEXT;

-- Fix foreign key constraints if they exist
ALTER TABLE IF EXISTS stripe_subscriptions 
  DROP CONSTRAINT IF EXISTS stripe_subscriptions_user_id_fkey;
  
ALTER TABLE IF EXISTS stripe_subscriptions 
  ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS stripe_customers
  DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;
  
ALTER TABLE IF EXISTS stripe_customers
  ADD CONSTRAINT stripe_customers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;