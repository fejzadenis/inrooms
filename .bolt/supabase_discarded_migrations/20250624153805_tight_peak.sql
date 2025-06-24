/*
  # Stripe Integration Setup

  1. New Tables
    - `stripe_customers` - Store Stripe customer information
    - `stripe_subscriptions` - Store subscription details
    - `stripe_invoices` - Store invoice history
    - `stripe_payment_methods` - Store payment method information

  2. Security
    - Enable RLS on all Stripe tables
    - Add policies for user access to their own data
    - Admin access to all data

  3. Updates
    - Add Stripe fields to users table
    - Create indexes for performance
*/

-- Add Stripe fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_status text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_current_period_end timestamptz;

-- Create Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Stripe subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL,
  price_id text NOT NULL,
  quantity integer DEFAULT 1,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Stripe invoices table
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  subscription_id text REFERENCES stripe_subscriptions(id) ON DELETE SET NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_paid integer NOT NULL,
  amount_due integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  hosted_invoice_url text,
  invoice_pdf text,
  created_at timestamptz DEFAULT now()
);

-- Create Stripe payment methods table
CREATE TABLE IF NOT EXISTS stripe_payment_methods (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  card_brand text,
  card_last4 text,
  card_exp_month integer,
  card_exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all Stripe tables
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_customers
CREATE POLICY "Users can view own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all customer data"
  ON stripe_customers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Policies for stripe_subscriptions
CREATE POLICY "Users can view own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all subscription data"
  ON stripe_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Policies for stripe_invoices
CREATE POLICY "Users can view own invoice data"
  ON stripe_invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all invoice data"
  ON stripe_invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Policies for stripe_payment_methods
CREATE POLICY "Users can view own payment methods"
  ON stripe_payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage own payment methods"
  ON stripe_payment_methods
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all payment methods"
  ON stripe_payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stripe_customers_user_id_idx ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_customer_id_idx ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_user_id_idx ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS stripe_subscriptions_status_idx ON stripe_subscriptions(status);
CREATE INDEX IF NOT EXISTS stripe_invoices_customer_id_idx ON stripe_invoices(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_user_id_idx ON stripe_invoices(user_id);
CREATE INDEX IF NOT EXISTS stripe_payment_methods_customer_id_idx ON stripe_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS stripe_payment_methods_user_id_idx ON stripe_payment_methods(user_id);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS stripe_customers_user_id_unique ON stripe_customers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer_id_unique ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;