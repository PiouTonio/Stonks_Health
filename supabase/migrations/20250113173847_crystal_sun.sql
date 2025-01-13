/*
  # Simplification des politiques de rendez-vous

  1. Changements
    - Simplification de la politique de création de rendez-vous
    - Utilisation de sous-requêtes indépendantes pour éviter la récursion
    - Optimisation des vérifications de disponibilité

  2. Sécurité
    - Maintien des restrictions d'accès basées sur les rôles
    - Vérification des créneaux horaires et des absences
*/

-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can update appointment status" ON appointments;

-- Politique simplifiée pour la création de rendez-vous
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
      AND appointments.appointment_date BETWEEN da.start_date AND da.end_date
    )
  );

-- Politique pour la lecture des rendez-vous (médecins)
CREATE POLICY "Doctors can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

-- Politique pour la lecture des rendez-vous (patients)
CREATE POLICY "Patients can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

-- Politique pour la mise à jour des rendez-vous (médecins)
CREATE POLICY "Doctors can update appointments"
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