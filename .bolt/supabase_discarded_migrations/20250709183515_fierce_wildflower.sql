/*
  # Fix registrations table user_id column type

  1. Changes
    - Change user_id column type from UUID to TEXT in registrations table
    - This allows Firebase user IDs (which are strings) to be stored properly
    
  2. Security
    - Maintains existing RLS policies
*/

-- Change the user_id column type from UUID to TEXT
ALTER TABLE registrations ALTER COLUMN user_id TYPE TEXT;

-- Update the foreign key constraint to match the users table id type
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;