/*
  # Create quote requests table for enterprise inquiries

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `company_name` (text, required)
      - `contact_name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `team_size` (text, required)
      - `requirements` (text, required)
      - `timeline` (text, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `quote_requests` table
    - Add policy for admin access only

  3. Performance
    - Add indexes on status and created_at columns
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
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests(created_at);