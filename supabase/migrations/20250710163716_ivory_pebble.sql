/*
  # Add Free Trial Support

  1. New Functions
    - `start_free_trial` - Starts a free trial for a user
    - `check_trial_eligibility` - Checks if a user is eligible for a free trial

  2. Changes
    - Adds functions to manage free trials
    - Ensures proper tracking of trial status and expiration

  3. Security
    - Functions run with security definer privileges
    - Only authenticated users can start trials
*/

-- Create a function to check if a user is eligible for a free trial
CREATE OR REPLACE FUNCTION check_trial_eligibility(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_had_trial BOOLEAN;
BEGIN
  -- Check if user has already had a trial
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND (
      subscription_status = 'trial' OR
      subscription_trial_ends_at IS NOT NULL
    )
  ) INTO has_had_trial;
  
  -- User is eligible if they haven't had a trial before
  RETURN NOT has_had_trial;
END;
$$;

-- Create a function to start a free trial for a user
CREATE OR REPLACE FUNCTION start_free_trial(user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_eligible BOOLEAN;
  trial_end_date TIMESTAMPTZ;
BEGIN
  -- Check eligibility
  SELECT check_trial_eligibility(user_id) INTO is_eligible;
  
  IF NOT is_eligible THEN
    RETURN FALSE;
  END IF;
  
  -- Set trial end date (7 days from now)
  trial_end_date := NOW() + INTERVAL '7 days';
  
  -- Update user with trial information
  UPDATE users
  SET 
    subscription_status = 'trial',
    subscription_events_quota = 1,
    subscription_events_used = 0,
    subscription_trial_ends_at = trial_end_date,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_trial_eligibility(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_free_trial(TEXT) TO authenticated;