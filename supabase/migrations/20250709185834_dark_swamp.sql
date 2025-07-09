/*
  # Update Event Registration Process

  1. Changes
    - Create a function to directly update user's subscription_events_used count
    - Skip storing registrations in the registrations table
    - Update events table current_participants count
    - Add proper error handling and validation

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access controls
*/

-- Create a function to directly update user's subscription_events_used count
CREATE OR REPLACE FUNCTION increment_user_event_usage(user_id TEXT, event_id TEXT)
RETURNS VOID AS $$
DECLARE
  current_quota INTEGER;
  current_usage INTEGER;
  event_exists BOOLEAN;
BEGIN
  -- Check if the event exists
  SELECT EXISTS(
    SELECT 1 FROM events WHERE id = event_id
  ) INTO event_exists;
  
  IF NOT event_exists THEN
    RAISE EXCEPTION 'Event with ID % does not exist', event_id;
  END IF;

  -- Get current quota and usage
  SELECT 
    subscription_events_quota, 
    subscription_events_used 
  INTO 
    current_quota, 
    current_usage
  FROM 
    users 
  WHERE 
    id = user_id;
    
  -- Check if user has available quota
  IF current_usage >= current_quota THEN
    RAISE EXCEPTION 'User has reached event quota limit (% of %)', current_usage, current_quota;
  END IF;
  
  -- Update the user's events_used count
  UPDATE users
  SET 
    subscription_events_used = subscription_events_used + 1,
    updated_at = NOW()
  WHERE 
    id = user_id;
    
  -- Update the event's current participants count
  UPDATE events
  SET 
    current_participants = current_participants + 1,
    updated_at = NOW()
  WHERE 
    id = event_id;
    
  -- Return success
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_event_usage(TEXT, TEXT) TO authenticated;

-- Create a function to check if a user can register for an event
CREATE OR REPLACE FUNCTION can_register_for_event(user_id TEXT, event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_quota INTEGER;
  current_usage INTEGER;
  event_exists BOOLEAN;
  already_registered BOOLEAN;
BEGIN
  -- Check if the event exists
  SELECT EXISTS(
    SELECT 1 FROM events WHERE id = event_id
  ) INTO event_exists;
  
  IF NOT event_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is already registered
  SELECT EXISTS(
    SELECT 1 FROM registrations 
    WHERE user_id = user_id AND event_id = event_id
  ) INTO already_registered;
  
  IF already_registered THEN
    RETURN FALSE;
  END IF;

  -- Get current quota and usage
  SELECT 
    subscription_events_quota, 
    subscription_events_used 
  INTO 
    current_quota, 
    current_usage
  FROM 
    users 
  WHERE 
    id = user_id;
    
  -- Check if user has available quota
  RETURN current_usage < current_quota;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_register_for_event(TEXT, TEXT) TO authenticated;