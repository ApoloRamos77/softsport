
import React, { useState, useEffect } from 'react';

interface ScholarshipFormProps {
  onCancel: () => void;
  onSubmit: (becaData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ScholarshipForm: React.FC<ScholarshipFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [porcentaje, setPorcentaje] = useState('0');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setDescripcion(initialData.descripcion || '');
      setPorcentaje(initialData.porcentaje?.toString() || '0');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre del programa es requerido');
      return;
    }

    const porcentajeNum = parseFloat(porcentaje);
    if (porcentajeNum < 0 || porcentajeNum > 100) {
      alert('El porcentaje debe estar entre 0 y 100');
      return;
    }

    const becaData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      porcentaje: porcentajeNum,
    };

    onSubmit(becaData);
  };

  return (
    <div className="card shadow-lg mx-auto border-0" style={{ maxWidth: '500px', backgroundColor: '#161b22' }}>
      <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
        <h5 className="mb-0 fw-bold text-white fs-6">{isEditing ? 'Editar Programa de Becas' : 'Nuevo Programa de Becas'}</h5>
        <p className="text-secondary mb-0 small">Configura los detalles del descuento para estudiantes</p>
      </div>

      <div className="card-body p-4">
        <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Nombre del Programa</label>
            <input
              type="text"
              placeholder="Ej: Beca Deportiva"
              className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Descripción (Opcional)</label>
            <textarea
              rows={3}
              placeholder="Descripción del programa..."
              className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Porcentaje de Beca (%)</label>
            <div className="input-group">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                required
              />
              <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary">%</span>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline-secondary border-opacity-25 text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScholarshipForm;
