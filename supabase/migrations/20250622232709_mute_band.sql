/*
  # Fix Users Table RLS Policy for INSERT Operations

  1. Security Changes
    - Add INSERT policy for users table to allow authenticated users to create their own profile
    - This allows new users to insert their profile data during signup/onboarding

  2. Policy Details
    - Policy allows INSERT operations for authenticated users
    - Users can only insert records where the id matches their auth.uid()
    - This prevents users from creating profiles for other users
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid())::text = id);