/*
  # Add featuredUntil to demos table

  1. New Columns
    - `featuredUntil` (timestamp with time zone) - When the featured status expires
  
  2. Changes
    - Add featuredUntil column to demos table
*/

-- Add featuredUntil column to demos table
ALTER TABLE IF EXISTS demos
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of featured demos
CREATE INDEX IF NOT EXISTS demos_featured_until_idx ON demos(featured_until);