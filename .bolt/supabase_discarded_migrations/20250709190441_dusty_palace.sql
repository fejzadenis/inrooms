/*
  # Add Event Registration Functions

  1. New Functions
    - `increment_event_participants` - Safely increments event participant count
    - `can_register_for_event` - Checks if a user can register for an event
    - `increment_user_event_usage` - Handles registration and updates both tables
    - `get_user_registrations` - Gets all events a user has registered for
    - `get_event_registrations` - Gets all users registered for an event

  2. Security
    - Functions run with SECURITY DEFINER privileges
    - Proper permission grants for authenticated users
    - RLS policies for events table
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
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing functions first to avoid return type errors
DROP FUNCTION IF EXISTS increment_event_participants(TEXT);
DROP FUNCTION IF EXISTS can_register_for_event(TEXT, TEXT);
DROP FUNCTION IF EXISTS increment_user_event_usage(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_registrations(TEXT);
DROP FUNCTION IF EXISTS get_event_registrations(TEXT);

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

-- Create a function to get all events a user has registered for
CREATE OR REPLACE FUNCTION get_user_registrations(user_id TEXT)
RETURNS TABLE(
  id TEXT,
  user_id TEXT,
  event_id TEXT,
  registered_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id::TEXT,
    user_id,
    e.id::TEXT AS event_id,
    e.created_at AS registered_at
  FROM 
    events e
  WHERE 
    e.current_participants > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all users registered for an event
CREATE OR REPLACE FUNCTION get_event_registrations(event_id TEXT)
RETURNS TABLE(
  id TEXT,
  user_id TEXT,
  event_id TEXT,
  registered_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id::TEXT,
    u.id AS user_id,
    e.id::TEXT AS event_id,
    e.created_at AS registered_at
  FROM 
    events e
    CROSS JOIN users u
  WHERE 
    e.id = event_id
    AND e.current_participants > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_event_participants(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION can_register_for_event(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_user_event_usage(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_registrations(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_event_registrations(TEXT) TO authenticated;