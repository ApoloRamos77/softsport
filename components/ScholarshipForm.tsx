
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
    <div className="card max-w-2xl mx-auto shadow-xl border border-secondary border-opacity-25 animate-fadeIn mb-10" style={{ backgroundColor: '#161b22' }}>
      <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
        <h2 className="text-xl font-bold text-white mb-0 tracking-tight">
          {isEditing ? 'Edición de Beca' : 'Nuevo Programa de Beca'}
        </h2>
        <p className="text-secondary small mb-0 mt-1">Configura el nombre y porcentaje de descuento del programa</p>
      </div>

      <div className="card-body p-4">
        <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
          {/* Información del Programa */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Detalles del Programa</label>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Nombre del Programa</label>
                <input
                  type="text"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary focus-none"
                  placeholder="Ej: Beca Deportiva"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Descripción (Opcional)</label>
                <textarea
                  rows={3}
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary resize-none focus-none"
                  placeholder="Descripción del programa..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Configuración Financiera */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Impacto Financiero</label>
            <div className="col-md-6">
              <label className="form-label text-secondary small fw-bold">Porcentaje de Beca (%)</label>
              <div className="input-group">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white focus-none"
                  value={porcentaje}
                  onChange={(e) => setPorcentaje(e.target.value)}
                  required
                />
                <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary border-start-0">%</span>
              </div>
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
              {isEditing ? 'Guardar Cambios' : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScholarshipForm;
