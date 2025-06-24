/*
  # Create quote requests table

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `contact_name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `team_size` (text)
      - `requirements` (text)
      - `timeline` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `quote_requests` table
    - Add policy for admin access only
*/

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  team_size text NOT NULL,
  requirements text NOT NULL,
  timeline text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Only admins can access quote requests
CREATE POLICY "Admin can manage quote requests"
  ON quote_requests
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = 'uJLXftk0DCYd2ujOjxX30zETSm33'::uuid OR
    auth.jwt() ->> 'email' = 'admin@inrooms.com'
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests(created_at);