/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text, default 'user')
      - `photo_url` (text, optional)
      - `subscription_status` (text, default 'inactive')
      - `subscription_trial_ends_at` (timestamptz, optional)
      - `subscription_events_quota` (integer, default 0)
      - `subscription_events_used` (integer, default 0)
      - `profile_title` (text, optional)
      - `profile_company` (text, optional)
      - `profile_location` (text, optional)
      - `profile_about` (text, optional)
      - `profile_phone` (text, optional)
      - `profile_website` (text, optional)
      - `profile_linkedin` (text, optional)
      - `profile_skills` (text[], default '{}')
      - `profile_points` (integer, default 0)
      - `connections` (text[], default '{}')
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to manage their own data
    - Add policy for admin users to manage all data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  photo_url text,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('trial', 'active', 'inactive')),
  subscription_trial_ends_at timestamptz,
  subscription_events_quota integer DEFAULT 0,
  subscription_events_used integer DEFAULT 0,
  profile_title text,
  profile_company text,
  profile_location text,
  profile_about text,
  profile_phone text,
  profile_website text,
  profile_linkedin text,
  profile_skills text[] DEFAULT '{}',
  profile_points integer DEFAULT 0,
  connections text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Admin users can manage all data
CREATE POLICY "Admins can manage all data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );

-- Allow users to read other users' public profile data
CREATE POLICY "Users can read public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);