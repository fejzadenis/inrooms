/*
  # Create system_notifications table

  1. New Tables
    - `system_notifications`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `message` (text, required)
      - `type` (text, default 'info')
      - `priority` (text, default 'medium')
      - `recipients` (text, default 'all')
      - `status` (text, default 'draft')
      - `scheduled_at` (timestamp, optional)
      - `expires_at` (timestamp, optional)
      - `created_at` (timestamp, default now)
      - `created_by` (text, required)
      - `read_count` (integer, default 0)
      - `total_recipients` (integer, optional)
      - `updated_at` (timestamp, default now)

  2. Security
    - Enable RLS on `system_notifications` table
    - Add policy for admins to manage all notifications
    - Add policy for users to read active notifications
*/

CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'maintenance')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  recipients text DEFAULT 'all' CHECK (recipients IN ('all', 'admins', 'active_users', 'trial_users')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'active')),
  scheduled_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  read_count integer DEFAULT 0,
  total_recipients integer,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON system_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Users can read active notifications
CREATE POLICY "Users can read active notifications"
  ON system_notifications
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR status = 'sent');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS system_notifications_status_idx ON system_notifications(status);
CREATE INDEX IF NOT EXISTS system_notifications_created_at_idx ON system_notifications(created_at);
CREATE INDEX IF NOT EXISTS system_notifications_type_idx ON system_notifications(type);
CREATE INDEX IF NOT EXISTS system_notifications_recipients_idx ON system_notifications(recipients);