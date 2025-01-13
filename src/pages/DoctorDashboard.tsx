import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PlusCircle, User, Activity, Calendar, Clock, Filter, Heart, Thermometer, FileText, Trash2, Edit2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, parseISO, addMinutes, startOfToday } from 'date-fns';
import fr from 'date-fns/locale/fr';

interface Patient {
  id: string;
  full_name: string;
}

interface WeeklySchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Absence {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  patient: {
    full_name: string;
  };
}

interface MedicalRecord {
  id: string;
  consultation_date: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
}

export default function DoctorDashboard() {
  const { userProfile, signOut } = useAuth();
  const [view, setView] = useState<'patients' | 'appointments' | 'schedules' | 'absences' | 'records'>('patients');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddAbsence, setShowAddAbsence] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WeeklySchedule | null>(null);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [showAddMedicalRecord, setShowAddMedicalRecord] = useState(false);
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<string>('');
  const [patientRecords, setPatientRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);

  const [newMedicalRecord, setNewMedicalRecord] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    blood_pressure: '',
    heart_rate: 0,
    temperature: 36.5
  });

  const [newSchedule, setNewSchedule] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00'
  });

  const [newAbsence, setNewAbsence] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    if (userProfile?.id) {
      fetchPatients();
      fetchAppointments();
      fetchWeeklySchedules();
      fetchAbsences();
    }
  }, [userProfile]);

  // Effet pour filtrer les patients en fonction de la recherche
  useEffect(() => {
    const filtered = patients.filter(patient =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Effet pour charger les dossiers médicaux quand un patient est sélectionné
  useEffect(() => {
    if (selectedPatientRecords) {
      fetchPatientRecords(selectedPatientRecords);
    }
  }, [selectedPatientRecords]);

  async function fetchPatients() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_type', 'patient')
      .order('full_name');

    if (error) {
      toast.error('Erreur lors de la récupération des patients');
      return;
    }

    setPatients(data || []);
    setFilteredPatients(data || []);
  }

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patient:profiles!appointments_patient_id_fkey(full_name)')
      .eq('doctor_id', userProfile?.id)
      .order('appointment_date')
      .order('start_time');

    if (error) {
      toast.error('Erreur lors de la récupération des rendez-vous');
      return;
    }

    setAppointments(data || []);
  }

  async function fetchWeeklySchedules() {
    const { data, error } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', userProfile?.id)
      .order('day_of_week');

    if (error) {
      toast.error('Erreur lors de la récupération des horaires');
      return;
    }

    setWeeklySchedules(data || []);
  }

  async function fetchAbsences() {
    const { data, error } = await supabase
      .from('doctor_absences')
      .select('*')
      .eq('doctor_id', userProfile?.id)
      .order('start_date');

    if (error) {
      toast.error('Erreur lors de la récupération des absences');
      return;
    }

    setAbsences(data || []);
  }

  async function fetchPatientRecords(patientId: string) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('consultation_date', { ascending: false });

    if (error) {
      toast.error('Erreur lors de la récupération des dossiers médicaux');
      return;
    }

    setPatientRecords(data || []);
  }

  async function handleAddMedicalRecord(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Veuillez sélectionner un patient');
      return;
    }

    const { error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: selectedPatient,
        doctor_id: userProfile?.id,
        ...newMedicalRecord,
        consultation_date: new Date().toISOString().split('T')[0]
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout du dossier médical');
      return;
    }

    toast.success('Dossier médical ajouté avec succès');
    setShowAddMedicalRecord(false);
    setSelectedPatient('');
    setNewMedicalRecord({
      symptoms: '',
      diagnosis: '',
      treatment: '',
      notes: '',
      blood_pressure: '',
      heart_rate: 0,
      temperature: 36.5
    });
  }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from('doctor_schedules')
      .insert({
        doctor_id: userProfile?.id,
        ...newSchedule
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout de l\'horaire');
      return;
    }

    toast.success('Horaire ajouté avec succès');
    setShowAddSchedule(false);
    setNewSchedule({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00'
    });
    fetchWeeklySchedules();
  }

  async function handleUpdateSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSchedule) return;

    const { error } = await supabase
      .from('doctor_schedules')
      .update({
        day_of_week: newSchedule.day_of_week,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time
      })
      .eq('id', editingSchedule.id);

    if (error) {
      toast.error('Erreur lors de la modification de l\'horaire');
      return;
    }

    toast.success('Horaire modifié avec succès');
    setEditingSchedule(null);
    setNewSchedule({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00'
    });
    fetchWeeklySchedules();
  }

  async function handleDeleteSchedule(id: string) {
    const { error } = await supabase
      .from('doctor_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression de l\'horaire');
      return;
    }

    toast.success('Horaire supprimé avec succès');
    fetchWeeklySchedules();
  }

  async function handleAddAbsence(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase
      .from('doctor_absences')
      .insert({
        doctor_id: userProfile?.id,
        ...newAbsence
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout de l\'absence');
      return;
    }

    toast.success('Absence ajoutée avec succès');
    setShowAddAbsence(false);
    setNewAbsence({
      start_date: '',
      end_date: '',
      reason: ''
    });
    fetchAbsences();
  }

  async function handleDeleteAbsence(id: string) {
    const { error } = await supabase
      .from('doctor_absences')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression de l\'absence');
      return;
    }

    toast.success('Absence supprimée avec succès');
    fetchAbsences();
  }

  async function handleUpdateAppointmentStatus(appointmentId: string, status: 'completed' | 'cancelled') {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du rendez-vous');
      return;
    }

    toast.success('Statut du rendez-vous mis à jour');
    fetchAppointments();
  }

  const filteredAppointments = appointments.filter(appointment => {
    if (appointmentFilter === 'all') return true;
    return appointment.status === appointmentFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Espace Médecin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('patients')}
                className={`px-4 py-2 rounded-md ${
                  view === 'patients' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                Patients
              </button>
              <button
                onClick={() => setView('records')}
                className={`px-4 py-2 rounded-md ${
                  view === 'records' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5 inline-block mr-2" />
                Dossiers Patients
              </button>
              <button
                onClick={() => setView('appointments')}
                className={`px-4 py-2 rounded-md ${
                  view === 'appointments' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Rendez-vous
              </button>
              <button
                onClick={() => setView('schedules')}
                className={`px-4 py-2 rounded-md ${
                  view === 'schedules' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-5 h-5 inline-block mr-2" />
                Horaires
              </button>
              <button
                onClick={() => setView('absences')}
                className={`px-4 py-2 rounded-md ${
                  view === 'absences' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Absences
              </button>
              <button
                onClick={signOut}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {view === 'patients' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Mes Patients</h2>
              <button
                onClick={() => setShowAddMedicalRecord(!showAddMedicalRecord)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Ajouter un dossier médical
              </button>
            </div>

            {showAddMedicalRecord && (
              <form onSubmit={handleAddMedicalRecord} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => setSelectedPatient(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Sélectionner un patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tension artérielle</label>
                    <input
                      type="text"
                      value={newMedicalRecord.blood_pressure}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        blood_pressure: e.target.value
                      })}
                      placeholder="ex: 120/80"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fréquence cardiaque</label>
                    <input
                      type="number"
                      value={newMedicalRecord.heart_rate}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        heart_rate: parseInt(e.target.value)
                      })}
                      placeholder="BPM"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Température</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMedicalRecord.temperature}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        temperature: parseFloat(e.target.value)
                      })}
                      placeholder="°C"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Symptômes</label>
                    <textarea
                      value={newMedicalRecord.symptoms}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        symptoms: e.target.value
                      })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diagnostic</label>
                    <textarea
                      value={newMedicalRecord.diagnosis}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        diagnosis: e.target.value
                      })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Traitement</label>
                    <textarea
                      value={newMedicalRecord.treatment}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        treatment: e.target.value
                      })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      value={newMedicalRecord.notes}
                      onChange={(e) => setNewMedicalRecord({
                        ...newMedicalRecord,
                        notes: e.target.value
                      })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMedicalRecord(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {view === 'records' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Dossiers Médicaux des Patients</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher un patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <select
                  value={selectedPatientRecords}
                  onChange={(e) => setSelectedPatientRecords(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner un patient</option>
                  {filteredPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatientRecords && (
                <div className="space-y-6">
                  {patientRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Aucun dossier médical disponible pour ce patient
                    </p>
                  ) : (
                    patientRecords.map((record) => (
                      <div
                        key={record.id}
                        className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900">
                            Consultation du {format(new Date(record.consultation_date), 'EEEE d MMMM yyyy', { locale: fr })}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="text-sm text-gray-500">Tension</p>
                              <p className="font-medium">{record.blood_pressure}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Activity className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-sm text-gray-500">Fréquence cardiaque</p>
                              <p className="font-medium">{record.heart_rate} bpm</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Thermometer className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-gray-500">Température</p>
                              <p className="font-medium">{record.temperature}°C</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {record.symptoms && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Symptômes</h4>
                              <p className="text-gray-600">{record.symptoms}</p>
                            </div>
                          )}

                          {record.diagnosis && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Diagnostic</h4>
                              <p className="text-gray-600">{record.diagnosis}</p>
                            </div>
                          )}

                          {record.treatment && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Traitement</h4>
                              <p className="text-gray-600">{record.treatment}</p>
                            </div>
                          )}

                          {record.notes && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                              <p className="text-gray-600">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'appointments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Mes Rendez-vous</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value as typeof appointmentFilter)}
                    className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">Tous</option>
                    <option value="scheduled">Planifiés</option>
                    <option value="completed">Terminés</option>
                    <option value="cancelled">Annulés</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun rendez-vous {appointmentFilter !== 'all' ? `${appointmentFilter}` : ''} trouvé
                </p>
              ) : (
                filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{appointment.patient.full_name}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(appointment.appointment_date), 'EEEE d MMMM yyyy', { locale: fr })}
                          {' '}
                          {format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm')} - 
                          {format(new Date(`2000-01-01T${appointment.end_time}`), 'HH:mm')}
                        </p>
                        {appointment.reason && (
                          <p className="text-gray-600 mt-2">{appointment.reason}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                              className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                            >
                              Terminer
                            </button>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                              className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                        <span className={`px-2 py-1 text-sm rounded-md ${
                          appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {appointment.status === 'completed' ? 'Terminé' :
                           appointment.status === 'cancelled' ? 'Annulé' :
                           'Planifié'}
                        </span>
                      </div>
                 </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'schedules' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Mes Horaires</h2>
              <button
                onClick={() => {
                  setShowAddSchedule(true);
                  setEditingSchedule(null);
                  setNewSchedule({
                    day_of_week: 1,
                    start_time: '09:00',
                    end_time: '17:00'
                  });
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Ajouter un horaire
              </button>
            </div>

            {(showAddSchedule || editingSchedule) && (
              <form onSubmit={editingSchedule ? handleUpdateSchedule : handleAddSchedule} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jour</label>
                    <select
                      value={newSchedule.day_of_week}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        day_of_week: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de début</label>
                    <input
                      type="time"
                      value={newSchedule.start_time}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        start_time: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
                    <input
                      type="time"
                      value={newSchedule.end_time}
                      onChange={(e) => setNewSchedule({
                        ...newSchedule,
                        end_time: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSchedule(false);
                      setEditingSchedule(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    {editingSchedule ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {weeklySchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{dayNames[schedule.day_of_week]}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(`2000-01-01T${schedule.start_time}`), 'HH:mm')} - 
                        {format(new Date(`2000-01-01T${schedule.end_time}`), 'HH:mm')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setShowAddSchedule(false);
                          setNewSchedule({
                            day_of_week: schedule.day_of_week,
                            start_time: schedule.start_time,
                            end_time: schedule.end_time
                          });
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'absences' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Mes Absences</h2>
              <button
                onClick={() => setShowAddAbsence(!showAddAbsence)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Ajouter une absence
              </button>
            </div>

            {showAddAbsence && (
              <form onSubmit={handleAddAbsence} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de début</label>
                    <input
                      type="date"
                      value={newAbsence.start_date}
                      min={format(startOfToday(), 'yyyy-MM-dd')}
                      onChange={(e) => setNewAbsence({
                        ...newAbsence,
                        start_date: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                    <input
                      type="date"
                      value={newAbsence.end_date}
                      min={newAbsence.start_date || format(startOfToday(), 'yyyy-MM-dd')}
                      onChange={(e) => setNewAbsence({
                        ...newAbsence,
                        end_date: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Motif</label>
                    <input
                      type="text"
                      value={newAbsence.reason}
                      onChange={(e) => setNewAbsence({
                        ...newAbsence,
                        reason: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAbsence(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {absences.map((absence) => (
                <div key={absence.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        Du {format(new Date(absence.start_date), 'd MMMM yyyy', { locale: fr })} au{' '}
                        {format(new Date(absence.end_date), 'd MMMM yyyy', { locale: fr })}
                      </h3>
                      {absence.reason && (
                        <p className="text-sm text-gray-500">Motif : {absence.reason}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}