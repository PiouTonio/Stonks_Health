/*
  # Mise à jour des politiques pour la gestion des horaires et rendez-vous

  1. Modifications
    - Mise à jour des politiques pour permettre aux médecins de gérer leurs horaires
    - Mise à jour des politiques pour permettre aux médecins de gérer leurs absences
    - Mise à jour des politiques pour les rendez-vous avec vérification des disponibilités

  2. Sécurité
    - Ajout de vérifications pour les conflits de rendez-vous
    - Vérification des horaires du médecin
    - Vérification des absences du médecin
*/

-- Mise à jour des politiques pour doctor_schedules
DROP POLICY IF EXISTS "Doctors can manage their schedules" ON doctor_schedules;
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
  )
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

-- Mise à jour des politiques pour doctor_absences
DROP POLICY IF EXISTS "Doctors can manage their absences" ON doctor_absences;
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
  )
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'doctor'
    )
  );

-- Mise à jour de la politique pour les rendez-vous
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM doctor_schedules ds
      WHERE ds.doctor_id = appointments.doctor_id
      AND ds.day_of_week = EXTRACT(DOW FROM appointments.appointment_date)
      AND ds.start_time <= appointments.start_time
      AND ds.end_time >= appointments.end_time
      AND NOT EXISTS (
        SELECT 1 FROM doctor_absences da
        WHERE da.doctor_id = appointments.doctor_id
        AND appointments.appointment_date BETWEEN da.start_date AND da.end_date
      )
      AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.doctor_id = appointments.doctor_id
        AND a.appointment_date = appointments.appointment_date
        AND a.status = 'scheduled'
        AND (
          (appointments.start_time BETWEEN a.start_time AND a.end_time)
          OR (appointments.end_time BETWEEN a.start_time AND a.end_time)
          OR (appointments.start_time <= a.start_time AND appointments.end_time >= a.end_time)
        )
      )
    )
  );