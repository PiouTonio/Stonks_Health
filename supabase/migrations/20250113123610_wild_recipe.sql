/*
  # Add appointments system

  1. New Tables
    - `doctor_availability`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, references profiles)
      - `day_of_week` (integer, 0-6)
      - `start_time` (time)
      - `end_time` (time)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `doctor_id` (uuid, references profiles)
      - `patient_id` (uuid, references profiles)
      - `appointment_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `status` (text: scheduled, completed, cancelled)
      - `reason` (text)
  
  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for doctors and patients
*/

-- Doctor availability table
CREATE TABLE doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid REFERENCES profiles(id) NOT NULL,
  patient_id uuid REFERENCES profiles(id) NOT NULL,
  appointment_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_appointment_time CHECK (start_time < end_time)
);

-- Enable RLS
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for doctor_availability
CREATE POLICY "Doctors can manage their availability"
  ON doctor_availability
  FOR ALL
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

CREATE POLICY "Everyone can view doctor availability"
  ON doctor_availability
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for appointments
CREATE POLICY "Doctors can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

CREATE POLICY "Patients can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM doctor_availability
      WHERE doctor_id = appointments.doctor_id
      AND day_of_week = EXTRACT(DOW FROM appointments.appointment_date)
      AND start_time <= appointments.start_time
      AND end_time >= appointments.end_time
    )
  );

CREATE POLICY "Doctors can update appointment status"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );