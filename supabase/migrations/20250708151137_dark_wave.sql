/*
# Stripe Checkout Integration

1. New Tables
   - `stripe_payment_methods` - Stores payment methods linked to customers
   - `product_feedback` - Stores user feedback on products
   - `custom_quotes` - Stores custom quote requests

2. Security
   - Enable RLS on all tables
   - Add policies for proper access control
   - Set up foreign key constraints with CASCADE delete

3. Changes
   - Add metadata fields to Stripe tables
   - Add default_payment_method to customers table
   - Create email verification timestamp trigger
   - Create indexes for efficient querying
*/

-- Create custom_quotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS custom_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  team_size TEXT NOT NULL,
  requirements TEXT NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on custom_quotes
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can read all custom quotes" ON custom_quotes;
DROP POLICY IF EXISTS "Users can create custom quotes" ON custom_quotes;

-- Create policies
CREATE POLICY "Admins can read all custom quotes"
  ON custom_quotes
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() IN (
      SELECT users.id
      FROM auth.users
      WHERE users.role = 'admin'
    ))
  );

CREATE POLICY "Users can create custom quotes"
  ON custom_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Create function to update email_verified_timestamp
CREATE OR REPLACE FUNCTION update_email_verified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_verified = TRUE AND (OLD.email_verified IS NULL OR OLD.email_verified = FALSE) THEN
    NEW.email_verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email verification timestamp if it doesn't exist
DROP TRIGGER IF EXISTS set_email_verified_timestamp ON users;
CREATE TRIGGER set_email_verified_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_email_verified_timestamp();

-- Add product_feedback table for storing user feedback on products
CREATE TABLE IF NOT EXISTS product_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_feedback
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view public feedback" ON product_feedback;
DROP POLICY IF EXISTS "Users can manage their own feedback" ON product_feedback;

-- Create policies for product_feedback
CREATE POLICY "Anyone can view public feedback"
  ON product_feedback
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage their own feedback"
  ON product_feedback
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Create indexes for product_feedback
CREATE INDEX IF NOT EXISTS product_feedback_product_id_idx ON product_feedback(product_id);

-- Create indexes for custom_quotes
CREATE INDEX IF NOT EXISTS custom_quotes_created_at_idx ON custom_quotes(created_at);
CREATE INDEX IF NOT EXISTS custom_quotes_status_idx ON custom_quotes(status);

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