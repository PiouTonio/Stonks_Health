/*
  # Amélioration de la gestion des disponibilités des médecins

  1. Nouvelles Tables
    - `doctor_schedules` : Horaires hebdomadaires par défaut
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, référence vers profiles)
      - `day_of_week` (integer, 0-6)
      - `start_time` (time)
      - `end_time` (time)
      - `created_at` (timestamptz)

    - `doctor_absences` : Périodes d'absence/vacances
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, référence vers profiles)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les nouvelles tables
    - Ajout des politiques pour les médecins
*/

-- Table des horaires hebdomadaires
CREATE TABLE IF NOT EXISTS doctor_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Table des absences
CREATE TABLE IF NOT EXISTS doctor_absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Enable RLS
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_absences ENABLE ROW LEVEL SECURITY;

-- Policies pour doctor_schedules
CREATE POLICY "Doctors can manage their schedules"
  ON doctor_schedules
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

CREATE POLICY "Everyone can view doctor schedules"
  ON doctor_schedules
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour doctor_absences
CREATE POLICY "Doctors can manage their absences"
  ON doctor_absences
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

CREATE POLICY "Everyone can view doctor absences"
  ON doctor_absences
  FOR SELECT
  TO authenticated
  USING (true);