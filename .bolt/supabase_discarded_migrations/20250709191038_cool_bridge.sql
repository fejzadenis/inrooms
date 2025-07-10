/*
  # Fix UUID type casting in can_register_for_event function

  1. Function Updates
    - Update `can_register_for_event` function to properly cast text parameters to UUID
    - Ensure all UUID comparisons use explicit casting
    - Fix type mismatches that cause "operator does not exist: uuid = text" errors

  2. Changes Made
    - Cast user_id parameter to UUID when comparing with UUID columns
    - Cast event_id parameter to UUID when comparing with UUID columns
    - Maintain function logic while fixing type compatibility
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS can_register_for_event(text, text);

-- Create the corrected function with proper UUID casting
CREATE OR REPLACE FUNCTION can_register_for_event(
  user_id text,
  event_id text
) RETURNS boolean AS $$
DECLARE
  user_quota integer;
  user_used integer;
  event_max integer;
  event_current integer;
  already_registered boolean;
BEGIN
  -- Check if user exists and get quota info
  SELECT 
    subscription_events_quota,
    subscription_events_used
  INTO user_quota, user_used
  FROM users 
  WHERE id = user_id::uuid;
  
  -- If user not found, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user has quota available
  IF user_used >= user_quota THEN
    RETURN false;
  END IF;
  
  -- Check if event exists and get capacity info
  SELECT 
    max_participants,
    current_participants
  INTO event_max, event_current
  FROM events 
  WHERE id = event_id::uuid;
  
  -- If event not found, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if event is full
  IF event_current >= event_max THEN
    RETURN false;
  END IF;
  
  -- Check if user is already registered
  SELECT EXISTS(
    SELECT 1 
    FROM registrations 
    WHERE user_id = user_id::text 
    AND event_id = event_id::text
  ) INTO already_registered;
  
  -- If already registered, return false
  IF already_registered THEN
    RETURN false;
  END IF;
  
  -- All checks passed
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update the increment_user_event_usage function with proper casting
CREATE OR REPLACE FUNCTION increment_user_event_usage(
  user_id text,
  event_id text
) RETURNS boolean AS $$
DECLARE
  can_register boolean;
  registration_id uuid;
BEGIN
  -- First check if user can register
  SELECT can_register_for_event(user_id, event_id) INTO can_register;
  
  IF NOT can_register THEN
    RETURN false;
  END IF;
  
  -- Insert registration record
  INSERT INTO registrations (user_id, event_id)
  VALUES (user_id::text, event_id::text)
  RETURNING id INTO registration_id;
  
  -- Update user's event usage count
  UPDATE users 
  SET subscription_events_used = subscription_events_used + 1
  WHERE id = user_id::uuid;
  
  -- Update event's current participants count
  UPDATE events 
  SET current_participants = current_participants + 1
  WHERE id = event_id::uuid;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, return false
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper functions for getting registrations with proper casting
CREATE OR REPLACE FUNCTION get_user_registrations(
  input_user_id text
) RETURNS TABLE (
  id uuid,
  user_id text,
  event_id text,
  registered_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.event_id,
    r.registered_at
  FROM registrations r
  WHERE r.user_id = input_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_event_registrations(
  input_event_id text
) RETURNS TABLE (
  id uuid,
  user_id text,
  event_id text,
  registered_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.event_id,
    r.registered_at
  FROM registrations r
  WHERE r.event_id = input_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;