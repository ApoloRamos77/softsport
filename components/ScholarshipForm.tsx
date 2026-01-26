
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
    <div className="max-w-md mx-auto">
      <div className="bg-[#1a2332] rounded-lg shadow-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-6 text-white">Nuevo Programa de Becas</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Nombre del Programa</label>
            <input 
              type="text" 
              placeholder="Ej: Beca Deportiva"
              className="bg-[#0f1419] p-3 rounded-md border border-blue-500 text-white w-full focus:outline-none focus:border-blue-400 placeholder:text-slate-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Descripción (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Descripción del programa"
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Porcentaje de Beca</label>
            <input 
              type="number" 
              min="0"
              max="100"
              step="0.01"
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full focus:outline-none focus:border-blue-500"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
            />
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
              className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-medium text-sm shadow-lg shadow-blue-500/20"
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
