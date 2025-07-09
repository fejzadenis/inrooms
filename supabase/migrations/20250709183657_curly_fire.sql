/*
  # Fix registrations user_id column type for Firebase integration

  1. Changes
    - Drop RLS policy that depends on user_id column
    - Change user_id column type from UUID to TEXT
    - Recreate the foreign key constraint
    - Recreate the RLS policy with proper type casting
  
  2. Security
    - Temporarily drops and then recreates the RLS policy
    - Maintains the same security model
*/

-- First drop the policy that depends on the user_id column
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;

-- Change the user_id column type from UUID to TEXT
ALTER TABLE registrations ALTER COLUMN user_id TYPE TEXT;

-- Update the foreign key constraint to match the users table id type
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate the policy with the correct column type
CREATE POLICY "Users can manage own registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);