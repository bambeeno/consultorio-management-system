/**
 * Página de Gestión de Turnos
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import AppointmentForm from '../components/appointments/AppointmentForm';
import appointmentService from '../services/appointmentService';
import type { Appointment, AppointmentCreate } from '../types/appointment';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  /**
   * Cargar turnos
   */
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAll();
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /**
   * Crear turno
   */
  const handleCreate = async (data: AppointmentCreate) => {
    try {
      await appointmentService.create(data);
      await loadAppointments();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  /**
   * Actualizar turno
   */
  const handleUpdate = async (id: number, data: AppointmentCreate) => {
    try {
      await appointmentService.update(id, data);
      await loadAppointments();
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  /**
   * Eliminar turno
   */
  const handleDelete = async (id: number) => {
    if (!confirm('Estas seguro de eliminar este turno?')) return;
    
    try {
      await appointmentService.delete(id);
      await loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  /**
   * Abrir formulario para editar
   */
  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#051641]">
              Agenda de Turnos
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona los turnos de tu consultorio
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-[#0F6083] to-[#2CA1B1] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            + Nuevo Turno
          </button>
        </div>

        {/* Calendario */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#2CA1B1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando turnos...</p>
          </div>
        ) : (
          <AppointmentCalendar
            appointments={appointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Modal de formulario */}
        {showForm && (
          <AppointmentForm
            appointment={editingAppointment}
            onSubmit={editingAppointment
              ? (data) => handleUpdate(editingAppointment.id, data)
              : handleCreate
            }
            onClose={() => {
              setShowForm(false);
              setEditingAppointment(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
