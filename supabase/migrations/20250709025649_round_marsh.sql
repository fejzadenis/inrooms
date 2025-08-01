/*
  # Fix Event Registration and Subscription Management

  1. New Functions
    - `update_event_registration` - Updates event participants and user quota when registering
    - `reset_event_usage_on_renewal` - Resets event usage when subscription renews

  2. Triggers
    - Add trigger to update event registration counts
    - Add trigger to reset event usage on subscription renewal

  3. Changes
    - Ensure proper tracking of event usage in Supabase
    - Automatically reset usage counters on renewal
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

-- Create a function to reset event usage when subscription renews
CREATE OR REPLACE FUNCTION reset_event_usage_on_renewal()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when period start changes (indicating a renewal)
  IF NEW.current_period_start <> OLD.current_period_start THEN
    -- Reset the events used count
    UPDATE users
    SET 
      subscription_events_used = 0,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RAISE NOTICE 'Reset event usage for user % on subscription renewal', NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to reset event usage when subscription renews
DROP TRIGGER IF EXISTS reset_event_usage_trigger ON stripe_subscriptions;

CREATE TRIGGER reset_event_usage_trigger
AFTER UPDATE ON stripe_subscriptions
FOR EACH ROW
WHEN (NEW.current_period_start <> OLD.current_period_start)
EXECUTE FUNCTION reset_event_usage_on_renewal();