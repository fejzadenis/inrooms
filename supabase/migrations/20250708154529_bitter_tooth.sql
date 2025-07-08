/*
  # Create Stripe Checkout Sessions Table

  1. New Tables
    - `stripe_checkout_sessions`
      - `id` (text, primary key)
      - `user_id` (text, foreign key to users)
      - `customer_id` (text, foreign key to stripe_customers)
      - `price_id` (text, not null)
      - `status` (text, not null)
      - `metadata` (jsonb, nullable)
      - `success_url` (text, nullable)
      - `cancel_url` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `completed_at` (timestamptz, nullable)
  2. Security
    - Enable RLS on `stripe_checkout_sessions` table
    - Add policies for admin management and user access
  3. Indexes
    - Create indexes for customer_id, user_id, and status
*/

-- Create stripe_checkout_sessions table
CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id text REFERENCES stripe_customers(id) ON DELETE SET NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'created',
  metadata jsonb,
  success_url text,
  cancel_url text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage all checkout sessions" ON stripe_checkout_sessions;
DROP POLICY IF EXISTS "Users can view their own checkout sessions" ON stripe_checkout_sessions;

-- Create policies
CREATE POLICY "Admins can manage all checkout sessions"
  ON stripe_checkout_sessions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Users can view their own checkout sessions"
  ON stripe_checkout_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_customer_id_idx ON stripe_checkout_sessions(customer_id);
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_user_id_idx ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS stripe_checkout_sessions_status_idx ON stripe_checkout_sessions(status);