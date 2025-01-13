/*
  # Add doctor profiles policy

  1. Changes
    - Add a new policy for doctors to read all profiles
  
  2. Security
    - Doctors can read all profiles
    - Simple non-recursive policy
*/

CREATE POLICY "Doctors can read all profiles v2"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM auth.users u 
      INNER JOIN profiles p ON p.id = u.id 
      WHERE p.id = auth.uid() AND p.user_type = 'doctor'
    )
  );