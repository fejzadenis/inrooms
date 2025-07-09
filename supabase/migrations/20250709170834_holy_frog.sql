/*
  # Add Event Registration Trigger

  1. New Functions
    - `update_event_registration` - Updates user's event usage when registering for an event
    - Ensures event usage is properly tracked in the database

  2. Changes
    - Adds trigger to update event usage when a user registers for an event
    - Ensures event usage is properly tracked in the database
*/

-- Create a function to update event registration in Supabase
CREATE OR REPLACE FUNCTION update_event_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the event's current participants count
  UPDATE events
  SET 
    current_participants = current_participants + 1,
    updated_at = NOW()
  WHERE id = NEW.event_id;
  
  -- Update the user's events_used count
  UPDATE users
  SET 
    subscription_events_used = subscription_events_used + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update event registration when a new registration is created
DROP TRIGGER IF EXISTS update_event_registration_trigger ON registrations;

CREATE TRIGGER update_event_registration_trigger
AFTER INSERT ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_event_registration();