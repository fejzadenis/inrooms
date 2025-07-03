/*
  # Update inRooms Schema for New Vision

  1. Changes
    - Add new fields to users table for enhanced profiles
    - Add fields for product showcase functionality
    - Update RLS policies to reflect new functionality
    - Add indexes for improved performance

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access controls for new features
*/

-- Add new fields to users table for enhanced profiles
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS showcase_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS founder_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_stage TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Create a new table for rooms (virtual networking spaces)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  host_id TEXT REFERENCES users(id),
  capacity INTEGER NOT NULL DEFAULT 20,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  room_type TEXT NOT NULL DEFAULT 'networking',
  is_private BOOLEAN DEFAULT false,
  access_code TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  meeting_link TEXT,
  recording_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for room participants
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant',
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- Create a table for product feedback
CREATE TABLE IF NOT EXISTS product_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id TEXT REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for founder connections
CREATE TABLE IF NOT EXISTS founder_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id TEXT REFERENCES users(id),
  connection_id TEXT REFERENCES users(id),
  connection_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(founder_id, connection_id)
);

-- Enable RLS on new tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rooms
CREATE POLICY "Hosts can manage their rooms"
  ON rooms
  FOR ALL
  TO authenticated
  USING (host_id = auth.uid()::text);

CREATE POLICY "Public can view public rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (is_private = false OR host_id = auth.uid()::text);

-- Create RLS policies for room participants
CREATE POLICY "Users can manage their own participation"
  ON room_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Room hosts can view participants"
  ON room_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rooms
      WHERE rooms.id = room_participants.room_id
      AND rooms.host_id = auth.uid()::text
    )
  );

-- Create RLS policies for product feedback
CREATE POLICY "Users can manage their own feedback"
  ON product_feedback
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "Anyone can view public feedback"
  ON product_feedback
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Create RLS policies for founder connections
CREATE POLICY "Users can manage their own connections"
  ON founder_connections
  FOR ALL
  TO authenticated
  USING (founder_id = auth.uid()::text OR connection_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS rooms_host_id_idx ON rooms(host_id);
CREATE INDEX IF NOT EXISTS rooms_status_idx ON rooms(status);
CREATE INDEX IF NOT EXISTS rooms_scheduled_start_idx ON rooms(scheduled_start);
CREATE INDEX IF NOT EXISTS room_participants_room_id_idx ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS room_participants_user_id_idx ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS product_feedback_product_id_idx ON product_feedback(product_id);
CREATE INDEX IF NOT EXISTS founder_connections_founder_id_idx ON founder_connections(founder_id);
CREATE INDEX IF NOT EXISTS founder_connections_connection_id_idx ON founder_connections(connection_id);