/*
  # Auto-verify admin emails

  1. New Features
    - Add function to automatically verify admin emails
    - Add trigger to verify emails when user role is set to admin
    - Auto-verify admin@inrooms.com email

  2. Security
    - Maintains existing RLS policies
    - Only affects admin users
*/

-- Create a function to automatically verify admin emails
CREATE OR REPLACE FUNCTION auto_verify_admin_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is an admin or has admin@inrooms.com email, automatically verify
  IF NEW.role = 'admin' OR NEW.email = 'admin@inrooms.com' THEN
    NEW.email_verified = TRUE;
    NEW.email_verified_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically verify admin emails
DROP TRIGGER IF EXISTS auto_verify_admin_emails_trigger ON users;

CREATE TRIGGER auto_verify_admin_emails_trigger
BEFORE INSERT OR UPDATE OF role, email ON users
FOR EACH ROW
EXECUTE FUNCTION auto_verify_admin_emails();