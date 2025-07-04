/*
  # Add Email Verification Tracking

  1. New Fields
    - `email_verified` (boolean) - Tracks email verification status in our database
    - `email_verified_at` (timestamptz) - Records when email was verified

  2. Security
    - Maintain existing RLS policies
    - Allow users to update their own verification status

  3. Changes
    - Add fields to users table for tracking verification status
    - This provides a database-level verification status that can be checked independently of Firebase
*/

-- Add email verification tracking fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Create function to update verification timestamp when status changes to true
CREATE OR REPLACE FUNCTION update_email_verified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_verified = true AND (OLD.email_verified = false OR OLD.email_verified IS NULL) THEN
    NEW.email_verified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamp when email is verified
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_email_verified_timestamp'
  ) THEN
    CREATE TRIGGER set_email_verified_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verified_timestamp();
  END IF;
END $$;