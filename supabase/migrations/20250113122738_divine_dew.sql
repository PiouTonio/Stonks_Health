/*
  # Add doctor read policy for profiles

  1. Changes
    - Add policy allowing doctors to read all patient profiles
  
  2. Security
    - Doctors can now read all patient profiles
    - Only applies to doctors (user_type = 'doctor')
*/

CREATE POLICY "Doctors can read all patient profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'doctor'
    )
  );