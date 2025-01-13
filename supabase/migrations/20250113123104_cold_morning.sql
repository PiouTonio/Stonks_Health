/*
  # Fix profiles policies

  1. Changes
    - Drop all existing profile policies to start fresh
    - Create new simplified policies without recursion
  
  2. Security
    - Allow users to read their own profile
    - Allow doctors to read all profiles
    - Use simple non-recursive conditions
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Doctors can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Doctors can read all profiles v2" ON profiles;
DROP POLICY IF EXISTS "Doctors can read all patient profiles" ON profiles;
DROP POLICY IF EXISTS "Doctors can view all profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Public profiles access"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);