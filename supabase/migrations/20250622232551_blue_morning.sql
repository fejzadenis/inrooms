/*
  # Fix User ID Column Type for Firebase Integration

  1. Changes
    - Change users.id from uuid to text to support Firebase UIDs
    - Update all foreign key references to use text
    - Recreate all RLS policies with proper type casting

  2. Security
    - Maintains all existing RLS policies
    - Updates policy conditions to work with text-based IDs
*/

-- Drop ALL policies that might reference users.id column
DROP POLICY IF EXISTS "Admin can manage quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can manage all data" ON users;
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can read events" ON events;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations;
DROP POLICY IF EXISTS "Users can manage own registrations" ON registrations;

-- Drop foreign key constraints that reference users.id
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;

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

-- Recreate RLS policy for quote_requests table (without UUID casting)
CREATE POLICY "Admin can manage quote requests"
  ON quote_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );