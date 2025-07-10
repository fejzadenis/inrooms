/*
  # Fix Event Registration Process

  1. New Functions
    - `increment_by_one` - Simple function to increment a value by one
    - Ensures proper event participant counting

  2. Changes
    - Adds a simple RPC function for incrementing values
    - Fixes the issue with event registration not increasing participant count
*/

-- Create a function to increment a value by one
CREATE OR REPLACE FUNCTION increment_by_one()
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT coalesce(current_setting('increment_by_one.value', true)::integer, 0) + 1
$$;

-- Create a function to increment participants for a specific event
CREATE OR REPLACE FUNCTION increment_participants(event_id_input TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1,
      updated_at = NOW()
  WHERE id = event_id_input;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_by_one() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_participants(TEXT) TO authenticated;