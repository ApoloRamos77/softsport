
import React, { useState, useEffect } from 'react';

interface GroupFormProps {
  onCancel: () => void;
  onSubmit: (grupoData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

interface Servicio {
  id: number;
  nombre: string;
}

import { apiService } from '../services/api';

const GroupForm: React.FC<GroupFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [horario, setHorario] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    // Cargar servicios usando apiService
    const loadServicios = async () => {
      try {
        const data = await apiService.getAll<Servicio>('servicios');
        setServicios(data);
      } catch (err) {
        console.error('Error cargando servicios:', err);
      }
    };
    loadServicios();

    if (initialData) {
      setNombre(initialData.nombre || '');
      setHorario(initialData.descripcion || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre del grupo es requerido');
      return;
    }

    const grupoData = {
      nombre: nombre.trim(),
      descripcion: horario.trim() || null,
    };

    onSubmit(grupoData);
  };

  return (
    <div className="card max-w-2xl mx-auto shadow-xl border border-secondary border-opacity-25 animate-fadeIn mb-10" style={{ backgroundColor: '#161b22' }}>
      <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
        <h2 className="text-xl font-bold text-white mb-0 tracking-tight">
          {isEditing ? 'Edición de Grupo' : 'Nuevo Grupo'}
        </h2>
        <p className="text-secondary small mb-0 mt-1">Configura los detalles y horario del grupo</p>
      </div>

      <div className="card-body p-4">
        <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
          {/* Vínculo con Servicio */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Información del Grupo</label>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Nombre del Grupo *</label>
                <input
                  type="text"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary focus-none"
                  placeholder="Ej: Sub-8"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Servicio Asociado *</label>
                <select
                  className="form-select bg-[#0d1117] border-secondary border-opacity-25 text-white focus-none"
                  value={servicioId || ''}
                  onChange={(e) => setServicioId(e.target.value ? parseInt(e.target.value) : null)}
                  required
                >
                  <option value="" style={{ backgroundColor: '#0d1117' }}>Selecciona un servicio</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id} style={{ backgroundColor: '#0d1117' }}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Horario Section */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Planificación y Horario</label>
            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Días y Horas de Clase</label>
              <textarea
                rows={4}
                className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary resize-none focus-none"
                placeholder="Ej: Lunes, Miércoles y Viernes de 3:30 PM a 5:00 PM"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary border-opacity-25">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
              style={{ fontWeight: '600' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-sm btn-primary px-5 fw-bold shadow-sm"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', borderBottom: '2px solid #005cc5' }}
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;
