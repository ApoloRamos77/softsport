
import React, { useState, useEffect } from 'react';

interface CategoryFormProps {
  onCancel: () => void;
  onSubmit: (categoriaData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [edadMin, setEdadMin] = useState('');
  const [edadMax, setEdadMax] = useState('');

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || '');
      setDescripcion(initialData.descripcion || '');
      setEdadMin(initialData.edadMin?.toString() || '');
      setEdadMax(initialData.edadMax?.toString() || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    const categoriaData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      edadMin: edadMin ? parseInt(edadMin) : null,
      edadMax: edadMax ? parseInt(edadMax) : null,
    };

    onSubmit(categoriaData);
  };

  return (
    <div className="card max-w-2xl mx-auto shadow-xl border border-secondary border-opacity-25 animate-fadeIn mb-10" style={{ backgroundColor: '#161b22' }}>
      <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
        <h2 className="text-xl font-bold text-white mb-0 tracking-tight">
          {isEditing ? 'Edición de Categoría' : 'Nueva Categoría'}
        </h2>
        <p className="text-secondary small mb-0 mt-1">Configura los rangos de edad y detalles de la categoría</p>
      </div>

      <div className="card-body p-4">
        <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
          {/* Información Básica */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Identificación de Categoría</label>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Nombre de la Categoría *</label>
                <input
                  type="text"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary focus-none"
                  placeholder="Ej: Sub-15"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label text-secondary small fw-bold">Descripción / Notas</label>
                <textarea
                  rows={3}
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary resize-none focus-none"
                  placeholder="Escriba aquí los detalles de la categoría..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Requisitos y Asignación */}
          <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Requisitos y Staff</label>
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Edad Mínima</label>
                <input
                  type="number"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white focus-none"
                  placeholder="Ej: 5"
                  min="0"
                  max="100"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Edad Máxima</label>
                <input
                  type="number"
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white focus-none"
                  placeholder="Ej: 15"
                  min="0"
                  max="100"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group pt-2">
              <label className="form-label text-secondary small fw-bold mb-2">Entrenadores Asignados</label>
              <div className="p-3 rounded bg-black bg-opacity-30 border border-secondary border-opacity-10 text-secondary small fst-italic">
                <i className="bi bi-info-circle me-2"></i>
                No hay entrenadores configurados específicamente para esta categoría
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
              {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
