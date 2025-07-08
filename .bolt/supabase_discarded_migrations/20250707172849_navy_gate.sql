/*
  # Fix Stripe Payment Methods and Invoices Tables

  1. New Tables
    - `stripe_payment_methods` - Stores payment method information
    - `stripe_invoices` - Stores invoice information
  
  2. Changes
    - Fix type inconsistencies between user_id columns
    - Update foreign key constraints to use correct types
    - Add proper RLS policies for security
    - Add indexes for better performance
*/

-- First, check and fix the user_id column type in stripe_subscriptions if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    -- Alter the column type to match users.id (text)
    ALTER TABLE stripe_subscriptions ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Also check and fix the user_id column type in stripe_customers if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    -- Alter the column type to match users.id (text)
    ALTER TABLE stripe_customers ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

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

-- Fix foreign key constraints if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_subscriptions_user_id_fkey'
  ) THEN
    ALTER TABLE stripe_subscriptions 
      DROP CONSTRAINT stripe_subscriptions_user_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_customers_user_id_fkey'
  ) THEN
    ALTER TABLE stripe_customers
      DROP CONSTRAINT stripe_customers_user_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraints
ALTER TABLE stripe_subscriptions 
  ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_customers
  ADD CONSTRAINT stripe_customers_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;