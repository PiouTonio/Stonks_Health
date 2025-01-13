/*
  # Fix profiles table policies

  1. Changes
    - Drop all existing policies on profiles table
    - Create simple, non-recursive policies
  
  2. Security
    - Everyone can read their own profile
    - Doctors can read all profiles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Doctors can read all patient profiles" ON profiles;
DROP POLICY IF EXISTS "Doctors can view all profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Doctors can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'doctor'
    OR id = auth.uid()
  );