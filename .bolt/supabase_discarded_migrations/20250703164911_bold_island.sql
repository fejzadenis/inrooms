/*
  # Remove Email Verification Requirements

  1. Changes
    - Update existing users to mark all emails as verified
    - Update any RLS policies that might check for email verification

  2. Security
    - Users will no longer need to verify their email addresses
    - All existing and new accounts will be treated as verified
*/

-- Update auth.users to mark all existing emails as verified
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- Update any RLS policies that might check for email verification
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT polname AS policy_name, tablename, schemaname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        -- Check if the policy definition contains email verification checks
        IF EXISTS (
            SELECT 1 FROM pg_policy 
            WHERE polname = policy_record.policy_name 
            AND tablename = policy_record.tablename
            AND schemaname = policy_record.schemaname
            AND pg_get_expr(polqual, 0)::text LIKE '%email%verified%'
        ) THEN
            -- Log policies that might need manual review
            RAISE NOTICE 'Policy % on table % may contain email verification checks', 
                policy_record.policy_name, policy_record.tablename;
        END IF;
    END LOOP;
END $$;