import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Activity, Calendar, Clock, Heart, Thermometer, FileText, Filter } from 'lucide-react';
import { format, parseISO, addMinutes, startOfToday, isBefore, addDays, eachDayOfInterval } from 'date-fns';
import { toast } from 'react-hot-toast';
import fr from 'date-fns/locale/fr';

interface Doctor {
  id: string;
  full_name: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  doctor: {
    full_name: string;
  };
}

interface DoctorSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface DoctorAbsence {
  id: string;
  start_date: string;
  end_date: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  status: 'available' | 'unavailable' | 'booked';
}

interface HealthRecord {
  id: string;
  doctor_id: string;
  record_date: string;
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  notes: string;
  doctor: {
    full_name: string;
  };
}

export default function PatientDashboard() {
  const { userProfile, signOut } = useAuth();
  const [view, setView] = useState<'records' | 'appointments'>('records');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [showBooking, setShowBooking] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>([]);
  const [doctorAbsences, setDoctorAbsences] = useState<DoctorAbsence[]>([]);
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchHealthRecords();
      fetchAppointments();
      fetchDoctors();
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchDoctorSchedules();
      fetchDoctorAbsences();
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor && doctorSchedules.length > 0) {
      generateAvailableDays();
    }
  }, [selectedDoctor, doctorSchedules, doctorAbsences]);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedDoctor]);

  async function fetchHealthRecords() {
    const { data, error } = await supabase
      .from('health_records')
      .select(`
        *,
        doctor:profiles!health_records_doctor_id_fkey(full_name)
      `)
      .eq('patient_id', userProfile?.id)
      .order('record_date', { ascending: false });

    if (error) {
      toast.error('Erreur lors de la récupération des dossiers médicaux');
      return;
    }

    setHealthRecords(data || []);
  }

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, doctor:profiles!appointments_doctor_id_fkey(full_name)')
      .eq('patient_id', userProfile?.id)
      .order('appointment_date')
      .order('start_time');

    if (error) {
      toast.error('Erreur lors de la récupération des rendez-vous');
      return;
    }

    setAppointments(data || []);
  }

  async function fetchDoctors() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_type', 'doctor')
      .order('full_name');

    if (error) {
      toast.error('Erreur lors de la récupération des médecins');
      return;
    }

    setDoctors(data || []);
  }

  async function fetchDoctorSchedules() {
    const { data, error } = await supabase
      .from('doctor_schedules')
      .select('*')
      .eq('doctor_id', selectedDoctor)
      .order('day_of_week');

    if (error) {
      toast.error('Erreur lors de la récupération des horaires');
      return;
    }

    setDoctorSchedules(data || []);
  }

  async function fetchDoctorAbsences() {
    const { data, error } = await supabase
      .from('doctor_absences')
      .select('*')
      .eq('doctor_id', selectedDoctor)
      .gte('end_date', format(startOfToday(), 'yyyy-MM-dd'))
      .order('start_date');

    if (error) {
      toast.error('Erreur lors de la récupération des absences');
      return;
    }

    setDoctorAbsences(data || []);
  }

  function generateAvailableDays() {
    const days: Date[] = [];
    const today = startOfToday();
    const nextMonth = addDays(today, 30);

    const interval = eachDayOfInterval({ start: today, end: nextMonth });

    interval.forEach(date => {
      const dayOfWeek = date.getDay();
      const hasSchedule = doctorSchedules.some(schedule => schedule.day_of_week === dayOfWeek);
      const isAbsent = doctorAbsences.some(absence => {
        const absenceStart = new Date(absence.start_date);
        const absenceEnd = new Date(absence.end_date);
        return date >= absenceStart && date <= absenceEnd;
      });

      if (hasSchedule && !isAbsent) {
        days.push(date);
      }
    });

    setAvailableDays(days);
  }

  async function generateTimeSlots() {
    if (!selectedDate || !selectedDoctor) return;

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const schedule = doctorSchedules.find(s => s.day_of_week === dayOfWeek);

    if (!schedule) {
      setTimeSlots([]);
      return;
    }

    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('doctor_id', selectedDoctor)
      .eq('appointment_date', selectedDate)
      .eq('status', 'scheduled');

    const slots: TimeSlot[] = [];
    let currentTime = new Date(`2000-01-01T${schedule.start_time}`);
    const endTime = new Date(`2000-01-01T${schedule.end_time}`);

    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm');
      const endTimeString = format(addMinutes(currentTime, 30), 'HH:mm');

      const isBooked = existingAppointments?.some(apt => {
        const aptStart = apt.start_time;
        const aptEnd = apt.end_time;
        return timeString >= aptStart && timeString < aptEnd;
      });

      slots.push({
        time: timeString,
        available: !isBooked,
        status: isBooked ? 'booked' : 'available'
      });

      currentTime = addMinutes(currentTime, 30);
    }

    setTimeSlots(slots);
  }

  async function handleBookAppointment(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const appointmentDate = selectedDate;
    const startTime = selectedTime;
    const endTime = format(addMinutes(new Date(`2000-01-01T${selectedTime}`), 30), 'HH:mm');

    const { error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: selectedDoctor,
        patient_id: userProfile?.id,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        reason: reason,
        status: 'scheduled'
      });

    if (error) {
      toast.error('Erreur lors de la prise de rendez-vous');
      return;
    }

    toast.success('Rendez-vous pris avec succès');
    setShowBooking(false);
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
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
              <h1 className="text-xl font-semibold">Espace Patient</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('records')}
                className={`px-4 py-2 rounded-md ${
                  view === 'records' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-5 h-5 inline-block mr-2" />
                Dossier Médical
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
              <button
                onClick={() => setShowBooking(!showBooking)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Prendre rendez-vous
              </button>
            </div>

            {showBooking && (
              <form onSubmit={handleBookAppointment} className="mb-8 bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Médecin</label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => {
                        setSelectedDoctor(e.target.value);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Choisir un médecin</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDoctor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <div className="mt-1 grid grid-cols-7 gap-2">
                        {availableDays.map((date) => (
                          <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                            className={`p-2 text-center rounded-md ${
                              selectedDate === format(date, 'yyyy-MM-dd')
                                ? 'bg-indigo-600 text-white'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            <div className="text-xs">{format(date, 'EEE', { locale: fr })}</div>
                            <div className="font-semibold">{format(date, 'd')}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Horaires disponibles</label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`p-2 text-center rounded-md ${
                              !slot.available
                                ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                : selectedTime === slot.time
                                ? 'bg-indigo-600 text-white'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Motif</label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Motif de la consultation"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowBooking(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedDoctor || !selectedDate || !selectedTime}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            )}

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
                        <h3 className="font-medium">Dr. {appointment.doctor.full_name}</h3>
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
                ))
              )}
            </div>
          </div>
        )}

        {view === 'records' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                Mon Dossier Médical
              </h2>

              <div className="space-y-6">
                {healthRecords.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun dossier médical disponible
                  </p>
                ) : (
                  healthRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Consultation du {format(new Date(record.record_date), 'EEEE d MMMM yyyy', { locale: fr })}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Par Dr. {record.doctor.full_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                      {record.notes && (
                        <div className="mt-4 flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="text-gray-700">{record.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}