/**
 * Pagina de Historias Clinicas
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import MedicalRecordList from '../components/medical-records/MedicalRecordList';
import MedicalRecordForm from '../components/medical-records/MedicalRecordForm';
import medicalRecordService from '../services/medicalRecordService';
import type { MedicalRecord, MedicalRecordCreate } from '../types/medicalRecord';

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordService.getAll();
      setRecords(data.medical_records);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleCreate = async (data: MedicalRecordCreate) => {
    try {
      await medicalRecordService.create(data);
      await loadRecords();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  };

  const handleUpdate = async (id: number, data: MedicalRecordCreate) => {
    try {
      await medicalRecordService.update(id, data);
      await loadRecords();
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Estas seguro de eliminar esta historia clinica?')) return;
    
    try {
      await medicalRecordService.delete(id);
      await loadRecords();
    } catch (error) {
      console.error('Error deleting medical record:', error);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#051641]">
              Historias Clinicas
            </h1>
            <p className="text-gray-600 mt-1">
              Registro medico completo de tus pacientes
            </p>
          </div>

          <button
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-[#0F6083] to-[#2CA1B1] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            + Nueva Historia
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#2CA1B1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historias...</p>
          </div>
        ) : (
          <MedicalRecordList
            records={records}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showForm && (
          <MedicalRecordForm
            record={editingRecord}
            onSubmit={editingRecord
              ? (data) => handleUpdate(editingRecord.id, data)
              : handleCreate
            }
            onClose={() => {
              setShowForm(false);
              setEditingRecord(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
