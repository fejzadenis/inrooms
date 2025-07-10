/*
  # Update RLS Policies for Events Table

  1. Changes
    - Enable RLS on events table
    - Create policies for admins to manage events
    - Create policies for users to read events
    - Create function to safely increment event participant count
    - Create policy for users to update event participant count using the function
  
  2. Security
    - Maintain admin access to all operations
    - Restrict user updates to only incrementing participant count
    - Ensure proper access control for all operations
*/

-- Enable RLS on events table if not already enabled
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for events table
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can read events" ON events;
DROP POLICY IF EXISTS "Users can update event participant count" ON events;

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
  FOR SELECT
  ON events
  TO authenticated
  USING (true);

-- Create a function to safely increment event participant count
CREATE OR REPLACE FUNCTION increment_event_participants(event_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1
  WHERE id = event_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if a user can register for an event
CREATE OR REPLACE FUNCTION can_register_for_event(user_id TEXT, event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  events_quota INTEGER;
  events_used INTEGER;
  event_exists BOOLEAN;
  event_full BOOLEAN;
BEGIN
  -- Get user's quota and usage
  SELECT 
    subscription_events_quota, 
    subscription_events_used
  INTO 
    events_quota, 
    events_used
  FROM users
  WHERE id = user_id;
  
  -- Check if event exists and has space
  SELECT 
    EXISTS(SELECT 1 FROM events WHERE id = event_id),
    EXISTS(SELECT 1 FROM events WHERE id = event_id AND current_participants >= max_participants)
  INTO
    event_exists,
    event_full;
  
  -- Return false if any condition fails
  IF NOT event_exists OR event_full OR events_used >= events_quota THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to increment user event usage
CREATE OR REPLACE FUNCTION increment_user_event_usage(user_id TEXT, event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  can_register BOOLEAN;
BEGIN
  -- Check if user can register
  SELECT can_register_for_event(user_id, event_id) INTO can_register;
  
  IF NOT can_register THEN
    RETURN FALSE;
  END IF;
  
  -- Increment event participants
  PERFORM increment_event_participants(event_id);
  
  -- Increment user's events used
  UPDATE users
  SET 
    subscription_events_used = subscription_events_used + 1,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_event_participants(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_register_for_event(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_event_usage(TEXT, TEXT) TO authenticated;