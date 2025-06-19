/*
  # Create registrations table

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `event_id` (uuid, foreign key to events)
      - `registered_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `registrations` table
    - Add policies for users to manage their own registrations
    - Add policies for admin users to view all registrations
*/

CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users can manage their own registrations
CREATE POLICY "Users can manage own registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Admin users can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin'
    )
  );