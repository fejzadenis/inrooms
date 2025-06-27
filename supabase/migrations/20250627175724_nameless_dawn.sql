/*
  # Create Connection System Tables

  1. New Tables
    - `connection_requests`
      - `id` (uuid, primary key)
      - `from_user_id` (text, references users.id)
      - `to_user_id` (text, references users.id)
      - `status` (text, pending/accepted/rejected)
      - `message` (text, optional message)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.id)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `related_id` (text, optional related entity id)
      - `read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own connection requests and notifications
    - Add policies for reading connection requests between users

  3. Indexes
    - Add indexes for efficient querying of connection requests and notifications