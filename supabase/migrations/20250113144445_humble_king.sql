-- Mise à jour de la politique pour les rendez-vous
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;

CREATE POLICY "Patients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    patient_id = auth.uid()
  );