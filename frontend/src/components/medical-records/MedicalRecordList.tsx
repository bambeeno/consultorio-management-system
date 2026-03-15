import type { MedicalRecord } from '../../types/medicalRecord';

interface MedicalRecordListProps {
  records: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  onDelete: (id: number) => void;
}

export default function MedicalRecordList({
  records,
  onEdit,
  onDelete
}: MedicalRecordListProps) {

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('es-PY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">í³‹</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No hay historias clinicas
        </h3>
        <p className="text-gray-500">
          Crea la primera historia usando el boton de arriba
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {records.map(record => (
        <div
          key={record.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-[#051641]">
                  {record.patient_name || 'Paciente'}
                </h3>
                <span className="px-3 py-1 bg-[#B0E4E8] text-[#051641] rounded-full text-xs font-medium">
                  {formatDate(record.consultation_date)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Dr. {record.doctor_name || 'Doctor'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(record)}
                className="px-4 py-2 bg-[#2CA1B1] text-white rounded-lg hover:bg-[#0F6083] transition text-sm font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(record.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {record.chief_complaint && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Motivo de Consulta:</p>
                  <p className="text-gray-900">{record.chief_complaint}</p>
                </div>
              )}

              {record.symptoms && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sintomas:</p>
                  <p className="text-gray-900">{record.symptoms}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700">Diagnostico:</p>
                <p className="text-gray-900 font-medium">{record.diagnosis}</p>
              </div>

              {record.treatment && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Tratamiento:</p>
                  <p className="text-gray-900">{record.treatment}</p>
                </div>
              )}
            </div>

            <div className="bg-[#F8F8F9] rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Signos Vitales:</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {record.blood_pressure && (
                  <div>
                    <p className="text-gray-600">Presion:</p>
                    <p className="font-medium">{record.blood_pressure}</p>
                  </div>
                )}
                {record.heart_rate && (
                  <div>
                    <p className="text-gray-600">Pulso:</p>
                    <p className="font-medium">{record.heart_rate} bpm</p>
                  </div>
                )}
                {record.temperature && (
                  <div>
                    <p className="text-gray-600">Temperatura:</p>
                    <p className="font-medium">{record.temperature} C</p>
                  </div>
                )}
                {record.weight && (
                  <div>
                    <p className="text-gray-600">Peso:</p>
                    <p className="font-medium">{record.weight} kg</p>
                  </div>
                )}
                {record.height && (
                  <div>
                    <p className="text-gray-600">Altura:</p>
                    <p className="font-medium">{record.height} cm</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {record.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-1">Notas:</p>
              <p className="text-gray-600 text-sm italic">{record.notes}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            Creado: {formatDateTime(record.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
}
