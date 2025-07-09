/*
  # Fix Registrations Table Schema

  1. Changes
    - Ensure id column has proper default value
    - Add default value for registered_at column
    - Create indexes for better performance
    - Enable RLS on the table
    - Create proper RLS policies for text IDs

  2. Security
    - Allow users to manage their own registrations
    - Allow admins to view all registrations
*/

-- First, ensure the id column has the proper default value
ALTER TABLE registrations 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make sure the registered_at column has a default value
ALTER TABLE registrations 
ALTER COLUMN registered_at SET DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS registrations_user_id_idx ON registrations(user_id);
CREATE INDEX IF NOT EXISTS registrations_event_id_idx ON registrations(event_id);

-- Enable RLS on the registrations table
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the RLS policy for users to manage their own registrations
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;

CREATE POLICY "Users can manage own registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Drop and recreate the RLS policy for admins to view all registrations
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;

CREATE POLICY "Admins can view all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text
      AND users.role = 'admin'
    )
  );