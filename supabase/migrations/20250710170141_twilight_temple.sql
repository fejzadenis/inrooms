/*
  # Fix Event Registration Permissions

  1. Security Updates
    - Add INSERT policy for registrations table to allow users to register for events
    - Add UPDATE policy for users table to allow users to update their event usage
    - Ensure proper RLS policies are in place for event registration functionality

  2. Changes
    - Allow authenticated users to insert registrations for themselves
    - Allow authenticated users to update their own subscription_events_used count
*/

-- Allow users to insert their own registrations
CREATE POLICY "Users can insert own registrations"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own event usage count
CREATE POLICY "Users can update own event usage"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);