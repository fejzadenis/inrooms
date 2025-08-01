/*
  # Fix user ID column type for Firebase UIDs

  1. Changes
    - Change `users.id` column from `uuid` to `text` to accommodate Firebase UIDs
    - Update foreign key references in other tables
    - Update RLS policies to work with text IDs
    - Remove the default `gen_random_uuid()` since Firebase provides the ID

  2. Security
    - Maintain existing RLS policies with updated type casting
    - Ensure all foreign key constraints are preserved

  3. Notes
    - Firebase UIDs are strings, not UUIDs
    - This change allows proper syncing between Firebase and Supabase
*/

-- First, drop foreign key constraints that reference users.id
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Admins can manage all data" ON users;
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can read events" ON events;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;

-- Change the id column type from uuid to text
ALTER TABLE users ALTER COLUMN id TYPE text;
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Update foreign key columns to text as well
ALTER TABLE events ALTER COLUMN created_by TYPE text;
ALTER TABLE registrations ALTER COLUMN user_id TYPE text;

-- Recreate foreign key constraints
ALTER TABLE events ADD CONSTRAINT events_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Recreate RLS policies for users table
CREATE POLICY "Admins can manage all data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users users_1
      WHERE users_1.id = auth.uid()::text 
      AND users_1.role = 'admin'
    )
  );

CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can read public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate RLS policies for events table
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can read events"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Recreate RLS policies for registrations table
CREATE POLICY "Admins can view all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can manage own registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);