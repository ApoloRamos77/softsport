
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
    <div className="max-w-md mx-auto bg-[#161b22] rounded-lg shadow-xl border border-secondary border-opacity-25 p-6 animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 text-white">
        {isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}
      </h2>

      <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Nombre del Grupo *</label>
          <input
            type="text"
            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary"
            placeholder="Ej: Sub-8"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Servicio *</label>
          <select
            className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117]"
            value={servicioId || ''}
            onChange={(e) => setServicioId(e.target.value ? parseInt(e.target.value) : null)}
            required
          >
            <option value="" style={{ backgroundColor: '#0d1117' }}>Selecciona un servicio</option>
            {servicios.map(servicio => (
              <option key={servicio.id} value={servicio.id} className="text-white" style={{ backgroundColor: '#0d1117' }}>
                {servicio.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Horario / Descripción</label>
          <textarea
            rows={3}
            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary resize-none"
            placeholder="Ej: Lun-Mié-Vie 3:00 PM"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2 mt-2 pt-4 border-top border-secondary border-opacity-25">
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
            className="btn btn-sm btn-primary px-5 fw-bold"
            style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
          >
            {isEditing ? 'Guardar Cambios' : 'Guardar Grupo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;
