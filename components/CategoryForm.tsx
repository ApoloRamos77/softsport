
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
    <div className="max-w-md mx-auto bg-[#161b22] rounded-lg shadow-xl border border-secondary border-opacity-25 p-6 animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 text-white">
        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
      </h2>

      <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Nombre de la Categoría *</label>
          <input
            type="text"
            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary"
            placeholder="Ej: Sub-15"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Descripción (Opcional)</label>
          <textarea
            rows={3}
            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary resize-none"
            placeholder="Alguna observación..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="row g-3">
          <div className="col-6">
            <label className="form-label text-secondary small fw-bold">Edad Mínima</label>
            <input
              type="number"
              className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
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
              className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
              placeholder="Ej: 15"
              min="0"
              max="100"
              value={edadMax}
              onChange={(e) => setEdadMax(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label text-secondary small fw-bold">Entrenadores Asignados</label>
          <div className="card border-secondary border-opacity-25 bg-[#0d1117] p-3 text-secondary small fst-italic">
            No hay entrenadores disponibles actualmente
          </div>
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
            {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
