/*
  # Update RLS Policies for Event Registration

  1. Changes
    - Update RLS policies for events table to allow updating current_participants
    - Ensure proper access controls for event registration
    - Add policy for users to update event participant count

  2. Security
    - Maintain existing RLS policies
    - Add specific policy for event registration
*/

-- Enable RLS on events table if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for events table
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can read events" ON events;

-- Create policy for admins to manage events
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Create policy for users to read events
CREATE POLICY "Users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for users to update event participant count
CREATE POLICY "Users can update event participant count"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Only allow updating current_participants field
    (SELECT array_length(ARRAY(SELECT UNNEST(akeys(to_jsonb(NEW) - to_jsonb(OLD)))), 1)) = 1
    AND (to_jsonb(NEW) - to_jsonb(OLD)) ? 'current_participants'
    AND NEW.current_participants = OLD.current_participants + 1
  );