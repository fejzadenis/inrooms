/*
  # Add premium badge fields to users table

  1. New Columns
    - `has_premium_badge` (boolean) - Whether the user has purchased a premium badge
    - `premium_badge_until` (timestamp with time zone) - When the premium badge expires
  
  2. Changes
    - Add premium badge columns to users table
*/

-- Add premium badge columns to users table
ALTER TABLE IF EXISTS users
ADD COLUMN IF NOT EXISTS has_premium_badge BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_badge_until TIMESTAMP WITH TIME ZONE;