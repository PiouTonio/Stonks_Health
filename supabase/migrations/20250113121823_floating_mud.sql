/*
  # Health Records Schema

  1. New Tables
    - `health_records`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references profiles)
      - `doctor_id` (uuid, references profiles)
      - `record_date` (timestamp)
      - `blood_pressure` (text)
      - `heart_rate` (integer)
      - `temperature` (decimal)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on health_records table
    - Add policies for doctors to create and read records
    - Add policies for patients to read their own records
*/

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  record_date timestamptz DEFAULT now(),
  blood_pressure text,
  heart_rate integer,
  temperature decimal(4,1),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Doctors can create records
CREATE POLICY "Doctors can create health records"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'doctor'
    )
  );

-- Doctors can read all records
CREATE POLICY "Doctors can read health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'doctor'
    )
  );

-- Patients can only read their own records
CREATE POLICY "Patients can read own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
  );