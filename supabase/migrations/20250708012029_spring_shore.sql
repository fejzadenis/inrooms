/*
  # Fix Stripe Webhook Issues

  1. New Tables
    - `custom_quotes` - Store custom quote requests with proper structure
    - Add missing fields to existing tables for better webhook handling

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access

  3. Changes
    - Add metadata fields to store user_id consistently
    - Ensure proper foreign key relationships
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

-- Create RLS policies for custom_quotes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_quotes' AND policyname = 'Admins can read all custom quotes'
  ) THEN
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
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_quotes' AND policyname = 'Users can create custom quotes'
  ) THEN
    CREATE POLICY "Users can create custom quotes"
      ON custom_quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Add metadata field to stripe_subscriptions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE stripe_subscriptions ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Add metadata field to stripe_customers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE stripe_customers ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Add default_payment_method field to stripe_customers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'default_payment_method'
  ) THEN
    ALTER TABLE stripe_customers ADD COLUMN default_payment_method TEXT;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS custom_quotes_created_at_idx ON custom_quotes(created_at);
CREATE INDEX IF NOT EXISTS custom_quotes_status_idx ON custom_quotes(status);

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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_email_verified_timestamp'
  ) THEN
    CREATE TRIGGER set_email_verified_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verified_timestamp();
  END IF;
END $$;

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

-- Create RLS policies for product_feedback if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_feedback' AND policyname = 'Anyone can view public feedback'
  ) THEN
    CREATE POLICY "Anyone can view public feedback"
      ON product_feedback
      FOR SELECT
      TO authenticated
      USING (is_public = true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_feedback' AND policyname = 'Users can manage their own feedback'
  ) THEN
    CREATE POLICY "Users can manage their own feedback"
      ON product_feedback
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid()::text);
  END IF;
END $$;

-- Create indexes for product_feedback
CREATE INDEX IF NOT EXISTS product_feedback_product_id_idx ON product_feedback(product_id);