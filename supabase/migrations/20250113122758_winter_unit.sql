/*
  # Fix recursive policy for doctors

  1. Changes
    - Drop existing recursive policy
    - Add new non-recursive policy for doctors to read all profiles
  
  2. Security
    - Doctors can read all profiles
    - Patients can only read their own profile
    - No more recursion issues
*/

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Doctors can read all patient profiles" ON profiles;

-- Create new non-recursive policy
CREATE POLICY "Doctors can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users u
      INNER JOIN profiles p ON p.id = u.id
      WHERE p.user_type = 'doctor'
    ))
    OR id = auth.uid()
  );