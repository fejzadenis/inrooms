/*
  # Fix Stripe Tables Migration

  1. Changes
    - Checks if policies exist before creating them
    - Fixes user_id column types in stripe tables
    - Creates payment methods and invoices tables if they don't exist
    - Adds proper foreign key constraints
    - Creates indexes for better performance
*/

-- First, check and fix the user_id column type in stripe_subscriptions if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    -- Drop foreign key constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'stripe_subscriptions_user_id_fkey'
    ) THEN
      ALTER TABLE stripe_subscriptions 
        DROP CONSTRAINT stripe_subscriptions_user_id_fkey;
    END IF;
    
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
    -- Drop foreign key constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'stripe_customers_user_id_fkey'
    ) THEN
      ALTER TABLE stripe_customers
        DROP CONSTRAINT stripe_customers_user_id_fkey;
    END IF;
    
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

-- Create RLS policies for payment methods if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_payment_methods' AND policyname = 'Users can view their own payment methods'
  ) THEN
    CREATE POLICY "Users can view their own payment methods"
      ON stripe_payment_methods
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_payment_methods' AND policyname = 'Admins can manage all payment methods'
  ) THEN
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
  END IF;
END $$;

-- Create RLS policies for invoices if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_invoices' AND policyname = 'Users can view their own invoices'
  ) THEN
    CREATE POLICY "Users can view their own invoices"
      ON stripe_invoices
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid()::text);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_invoices' AND policyname = 'Admins can manage all invoices'
  ) THEN
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
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS stripe_payment_methods_user_id_idx ON stripe_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS stripe_payment_methods_customer_id_idx ON stripe_payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_user_id_idx ON stripe_invoices(user_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_customer_id_idx ON stripe_invoices(customer_id);
CREATE INDEX IF NOT EXISTS stripe_invoices_subscription_id_idx ON stripe_invoices(subscription_id);

-- Add the correct foreign key constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_subscriptions_user_id_fkey'
  ) THEN
    ALTER TABLE stripe_subscriptions 
      ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_customers_user_id_fkey'
  ) THEN
    ALTER TABLE stripe_customers
      ADD CONSTRAINT stripe_customers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;