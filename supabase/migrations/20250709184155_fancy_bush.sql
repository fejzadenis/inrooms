/*
  # Fix Registration Data Types for Firebase Integration

  1. Changes
    - Change event_id column from uuid to text to support Firebase IDs
    - Drop and recreate constraints properly to avoid errors
    - Ensure compatibility between Supabase and Firebase data models

  2. Security
    - Maintain existing RLS policies
*/

-- Drop the unique constraint first (not the index)
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_user_id_event_id_key;

-- Drop existing foreign key constraint on event_id
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_event_id_fkey;

-- Change event_id column from uuid to text
ALTER TABLE registrations ALTER COLUMN event_id TYPE text;

-- Recreate the unique constraint with the new column type
ALTER TABLE registrations ADD CONSTRAINT registrations_user_id_event_id_key UNIQUE (user_id, event_id);

-- Note: We're not re-adding the foreign key constraint to events table
-- because Firebase events are stored separately and don't have UUID primary keys