
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
    <div className="max-w-md mx-auto">
      <div className="bg-[#1a1f2e] rounded-lg shadow-xl border border-slate-800 p-6">
        <h2 className="text-lg font-bold mb-6 text-white">Nueva Categoría</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Nombre de la Categoría</label>
            <input 
              type="text" 
              className="bg-[#0f1419] p-3 rounded-md border border-blue-500 text-white w-full focus:outline-none focus:border-blue-400 placeholder:text-slate-600"
              placeholder="Ej: Sub-15"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Descripción (Opcional)</label>
            <textarea 
              rows={4}
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              placeholder="Descripción de la categoría"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Edad Mínima</label>
              <input 
                type="number" 
                className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                placeholder="Ej: 5"
                min="0"
                max="100"
                value={edadMin}
                onChange={(e) => setEdadMin(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300">Edad Máxima</label>
              <input 
                type="number" 
                className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                placeholder="Ej: 15"
                min="0"
                max="100"
                value={edadMax}
                onChange={(e) => setEdadMax(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Usuarios Asignados (Entrenadores)</label>
            <div className="bg-[#0f1419] p-4 rounded-md border border-slate-700 text-slate-500 text-sm">
              No hay entrenadores disponibles
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-8 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-medium text-sm shadow-lg shadow-blue-500/20"
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
