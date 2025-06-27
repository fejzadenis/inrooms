/*
  # Create Stripe-related tables

  1. New Tables
    - `custom_quotes` - Stores custom quote requests
    - `stripe_products` - Stores Stripe product information
    - `stripe_prices` - Stores Stripe price information
    - `stripe_subscriptions` - Stores subscription information
    - `stripe_customers` - Stores customer information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admins
*/

-- Custom quotes table
CREATE TABLE IF NOT EXISTS custom_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  team_size text NOT NULL,
  requirements text NOT NULL,
  timeline text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id text PRIMARY KEY, -- Stripe product ID
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id text PRIMARY KEY, -- Stripe price ID
  product_id text NOT NULL REFERENCES stripe_products(id),
  currency text NOT NULL,
  unit_amount integer NOT NULL,
  interval text, -- 'month', 'year', etc.
  interval_count integer,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id text PRIMARY KEY, -- Stripe subscription ID
  user_id uuid NOT NULL REFERENCES auth.users(id),
  customer_id text NOT NULL, -- Stripe customer ID
  price_id text NOT NULL REFERENCES stripe_prices(id),
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  ended_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stripe customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id text PRIMARY KEY, -- Stripe customer ID
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  name text,
  default_payment_method text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE custom_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_quotes
CREATE POLICY "Admins can read all custom quotes"
  ON custom_quotes
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

CREATE POLICY "Users can create custom quotes"
  ON custom_quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for stripe_products
CREATE POLICY "Anyone can read active products"
  ON stripe_products
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage products"
  ON stripe_products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- RLS Policies for stripe_prices
CREATE POLICY "Anyone can read active prices"
  ON stripe_prices
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage prices"
  ON stripe_prices
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- RLS Policies for stripe_subscriptions
CREATE POLICY "Users can read their own subscriptions"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all subscriptions"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));

-- RLS Policies for stripe_customers
CREATE POLICY "Users can read their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'admin'
  ));