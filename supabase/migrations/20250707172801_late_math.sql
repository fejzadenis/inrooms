/*
  # Fix Webhook Handling for Stripe Integration

  1. New Tables
    - `stripe_payment_methods` - Stores payment method information
    - `stripe_invoices` - Stores invoice information

  2. Changes
    - Add missing tables needed for webhook handling
    - Ensure proper foreign key relationships
    - Enable RLS on all tables

  3. Security
    - Add appropriate RLS policies for all tables
    - Ensure users can only access their own data
    - Allow admins to access all data
*/

-- Create table for payment methods if it doesn't exist
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

-- Create table for invoices if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES stripe_customers(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES stripe_subscriptions(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_paid INTEGER NOT NULL,
  amount_due INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE stripe_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment methods
CREATE POLICY "Users can view their own payment methods"
  ON stripe_payment_methods
  FOR SELECT
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

-- Create RLS policies for invoices
CREATE POLICY "Users can view their own invoices"
  ON stripe_invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Admins can manage all invoices"
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stripe_payment_methods_user_id_idx ON stripe_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS stripe_payment_methods_customer_id_idx ON stripe_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_user_id_idx ON stripe_invoices(user_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_customer_id_idx ON stripe_invoices(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_subscription_id_idx ON stripe_invoices(subscription_id);

-- Add on_conflict handling to existing tables' foreign keys if needed
ALTER TABLE stripe_subscriptions 
  DROP CONSTRAINT IF EXISTS stripe_subscriptions_user_id_fkey,
  ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_customers
  DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey,
  ADD CONSTRAINT stripe_customers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;