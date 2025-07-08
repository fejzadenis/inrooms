/*
# Fix Stripe Webhook Processing

1. New Tables
   - None (uses existing tables)
   
2. Changes
   - Adds missing metadata columns to stripe tables
   - Adds email_verified timestamp functionality
   - Adds product feedback table with policies
   - Fixes foreign key constraints for cascade deletion
   
3. Security
   - Adds RLS policies for custom_quotes and product_feedback
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

-- Create RLS policies for custom_quotes with existence checks
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
END
$$;

-- Add metadata field to stripe_subscriptions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE stripe_subscriptions ADD COLUMN metadata JSONB;
  END IF;
END
$$;

-- Add metadata field to stripe_customers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE stripe_customers ADD COLUMN metadata JSONB;
  END IF;
END
$$;

-- Add default_payment_method field to stripe_customers if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'default_payment_method'
  ) THEN
    ALTER TABLE stripe_customers ADD COLUMN default_payment_method TEXT;
  END IF;
END
$$;

-- Create function to update email_verified_timestamp if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_email_verified_timestamp'
  ) THEN
    CREATE FUNCTION update_email_verified_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.email_verified = TRUE AND (OLD.email_verified IS NULL OR OLD.email_verified = FALSE) THEN
        NEW.email_verified_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

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
END
$$;

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

-- Create RLS policies for product_feedback with existence checks
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
END
$$;

-- Create indexes for product_feedback
CREATE INDEX IF NOT EXISTS product_feedback_product_id_idx ON product_feedback(product_id);

-- Create indexes for custom_quotes
CREATE INDEX IF NOT EXISTS custom_quotes_created_at_idx ON custom_quotes(created_at);
CREATE INDEX IF NOT EXISTS custom_quotes_status_idx ON custom_quotes(status);

-- Fix foreign key constraints if they exist
DO $$
BEGIN
  -- Check if the constraints exist and have the wrong type
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_subscriptions_user_id_fkey'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'user_id' AND data_type = 'text'
  ) THEN
    -- Drop and recreate the constraint
    ALTER TABLE stripe_subscriptions 
      DROP CONSTRAINT IF EXISTS stripe_subscriptions_user_id_fkey;
      
    ALTER TABLE stripe_subscriptions 
      ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stripe_customers_user_id_fkey'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stripe_customers' AND column_name = 'user_id' AND data_type = 'text'
  ) THEN
    -- Drop and recreate the constraint
    ALTER TABLE stripe_customers
      DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;
      
    ALTER TABLE stripe_customers
      ADD CONSTRAINT stripe_customers_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END
$$;