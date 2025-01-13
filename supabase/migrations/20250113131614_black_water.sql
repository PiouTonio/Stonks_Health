/*
  # Ajout des données médicales

  1. Nouvelles Tables
    - `medical_records`
      - `id` (uuid, clé primaire)
      - `patient_id` (uuid, référence vers profiles)
      - `doctor_id` (uuid, référence vers profiles)
      - `consultation_date` (date)
      - `symptoms` (text)
      - `diagnosis` (text)
      - `treatment` (text)
      - `notes` (text)
      - `blood_pressure` (text)
      - `heart_rate` (integer)
      - `temperature` (decimal)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Les médecins peuvent créer et lire tous les dossiers
    - Les patients peuvent uniquement lire leurs propres dossiers
*/

CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  consultation_date date NOT NULL DEFAULT CURRENT_DATE,
  symptoms text,
  diagnosis text,
  treatment text,
  notes text,
  blood_pressure text,
  heart_rate integer,
  temperature decimal(4,1),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Doctors can create and read all records
CREATE POLICY "Doctors can manage medical records"
  ON medical_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

-- Patients can only read their own records
CREATE POLICY "Patients can read their own medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());