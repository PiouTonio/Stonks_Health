-- Suppression des anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;

-- Politique pour la création de rendez-vous par les patients
CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM doctor_schedules ds
      WHERE ds.doctor_id = appointments.doctor_id
      AND ds.day_of_week = EXTRACT(DOW FROM appointments.appointment_date)::integer
      AND ds.start_time <= appointments.start_time::time
      AND ds.end_time >= appointments.end_time::time
    ) AND
    NOT EXISTS (
      SELECT 1 FROM doctor_absences da
      WHERE da.doctor_id = appointments.doctor_id
      AND appointments.appointment_date::date BETWEEN da.start_date AND da.end_date
    ) AND
    NOT EXISTS (
      SELECT 1 FROM appointments a2
      WHERE a2.doctor_id = appointments.doctor_id
      AND a2.appointment_date = appointments.appointment_date
      AND a2.status = 'scheduled'
      AND (
        (appointments.start_time::time, appointments.end_time::time) OVERLAPS 
        (a2.start_time::time, a2.end_time::time)
      )
    )
  );

-- Politique pour la lecture des rendez-vous par les médecins
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

-- Politique pour la lecture des rendez-vous par les patients
CREATE POLICY "Patients can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    patient_id = auth.uid()
  );

-- Politique pour la mise à jour du statut des rendez-vous par les médecins
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
  )
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );