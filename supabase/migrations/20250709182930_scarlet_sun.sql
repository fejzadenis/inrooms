/*
  # Fix User ID Type Mismatch Between Firebase and Supabase

  1. Changes
    - Convert user_id columns from UUID to text in all relevant tables
    - Update foreign key constraints to work with text IDs
    - Drop and recreate get_user_subscription function to avoid return type error
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper data access controls
*/

-- First, drop the function that's causing the error
DROP FUNCTION IF EXISTS get_user_subscription(text);

-- First, drop existing foreign key constraints that reference user_id columns
ALTER TABLE IF EXISTS registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE IF EXISTS stripe_subscriptions DROP CONSTRAINT IF EXISTS stripe_subscriptions_user_id_fkey;
ALTER TABLE IF EXISTS stripe_customers DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;
ALTER TABLE IF EXISTS stripe_invoices DROP CONSTRAINT IF EXISTS stripe_invoices_user_id_fkey;
ALTER TABLE IF EXISTS stripe_payment_methods DROP CONSTRAINT IF EXISTS stripe_payment_methods_user_id_fkey;
ALTER TABLE IF EXISTS stripe_checkout_sessions DROP CONSTRAINT IF EXISTS stripe_checkout_sessions_user_id_fkey;
ALTER TABLE IF EXISTS custom_quotes DROP CONSTRAINT IF EXISTS custom_quotes_assigned_to_fkey;
ALTER TABLE IF EXISTS events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE IF EXISTS product_feedback DROP CONSTRAINT IF EXISTS product_feedback_user_id_fkey;
ALTER TABLE IF EXISTS rooms DROP CONSTRAINT IF EXISTS rooms_host_id_fkey;
ALTER TABLE IF EXISTS room_participants DROP CONSTRAINT IF EXISTS room_participants_user_id_fkey;
ALTER TABLE IF EXISTS founder_connections DROP CONSTRAINT IF EXISTS founder_connections_founder_id_fkey;
ALTER TABLE IF EXISTS founder_connections DROP CONSTRAINT IF EXISTS founder_connections_connection_id_fkey;

-- Change user_id column types from uuid to text in registrations table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE registrations ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column types in stripe_subscriptions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_subscriptions' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE stripe_subscriptions ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column types in stripe_customers table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_customers' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE stripe_customers ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column types in stripe_invoices table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_invoices' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE stripe_invoices ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column types in stripe_payment_methods table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_payment_methods' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE stripe_payment_methods ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change user_id column types in stripe_checkout_sessions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_checkout_sessions' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE stripe_checkout_sessions ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change assigned_to column type in custom_quotes table (references users.id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_quotes' AND column_name = 'assigned_to' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE custom_quotes ALTER COLUMN assigned_to TYPE text;
  END IF;
END $$;

-- Change created_by column type in events table (references users.id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE events ALTER COLUMN created_by TYPE text;
  END IF;
END $$;

-- Change user_id column type in product_feedback table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_feedback' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE product_feedback ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change host_id column type in rooms table (references users.id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'host_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE rooms ALTER COLUMN host_id TYPE text;
  END IF;
END $$;

-- Change user_id column type in room_participants table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'room_participants' AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE room_participants ALTER COLUMN user_id TYPE text;
  END IF;
END $$;

-- Change founder_id and connection_id column types in founder_connections table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'founder_connections' AND column_name = 'founder_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE founder_connections ALTER COLUMN founder_id TYPE text;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'founder_connections' AND column_name = 'connection_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE founder_connections ALTER COLUMN connection_id TYPE text;
  END IF;
END $$;

-- Recreate foreign key constraints with correct text types
ALTER TABLE registrations 
ADD CONSTRAINT registrations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_subscriptions 
ADD CONSTRAINT stripe_subscriptions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_customers 
ADD CONSTRAINT stripe_customers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_invoices 
ADD CONSTRAINT stripe_invoices_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_payment_methods 
ADD CONSTRAINT stripe_payment_methods_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE stripe_checkout_sessions 
ADD CONSTRAINT stripe_checkout_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Note: custom_quotes.assigned_to references auth.users(id), not public.users(id)
-- So we don't recreate that foreign key constraint here

ALTER TABLE events 
ADD CONSTRAINT events_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE product_feedback 
ADD CONSTRAINT product_feedback_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE rooms 
ADD CONSTRAINT rooms_host_id_fkey 
FOREIGN KEY (host_id) REFERENCES users(id);

ALTER TABLE room_participants 
ADD CONSTRAINT room_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE founder_connections 
ADD CONSTRAINT founder_connections_founder_id_fkey 
FOREIGN KEY (founder_id) REFERENCES users(id);

ALTER TABLE founder_connections 
ADD CONSTRAINT founder_connections_connection_id_fkey 
FOREIGN KEY (connection_id) REFERENCES users(id);

-- Create an RPC function to get user subscription data (after dropping it above)
CREATE FUNCTION get_user_subscription(user_id text)
RETURNS TABLE(
  subscription_status text,
  subscription_events_quota integer,
  subscription_events_used integer,
  subscription_trial_ends_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.subscription_status,
    u.subscription_events_quota,
    u.subscription_events_used,
    u.subscription_trial_ends_at
  FROM users u
  WHERE u.id = user_id;
END;
$$;