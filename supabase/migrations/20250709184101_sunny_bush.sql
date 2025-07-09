/*
  # Fix registration data types

  1. Changes
    - Change event_id column from uuid to text to match Firebase event IDs
    - Ensure user_id remains as text (already correct)
    - Update foreign key constraints accordingly
    - Update indexes to work with text types

  2. Security
    - Maintain existing RLS policies
    - Keep all existing constraints where applicable
*/

-- Drop existing foreign key constraint on event_id
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_event_id_fkey;

-- Change event_id column from uuid to text
ALTER TABLE registrations ALTER COLUMN event_id TYPE text;

-- Update the unique constraint to work with text types
DROP INDEX IF EXISTS registrations_user_id_event_id_key;
CREATE UNIQUE INDEX registrations_user_id_event_id_key ON registrations USING btree (user_id, event_id);

-- Note: We're not re-adding the foreign key constraint to events table
-- because Firebase events are stored separately and don't have UUID primary keys