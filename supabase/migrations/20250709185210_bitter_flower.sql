/*
  # Fix Registrations Table Schema

  1. Changes
    - Ensure registrations table has proper column types (text for user_id and event_id)
    - Fix the id column to use gen_random_uuid() as default value
    - Update RLS policies to work with text IDs
    - Add proper indexes for performance

  2. Security
    - Maintain existing RLS policies with updated column types
    - Ensure proper access controls for registrations
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