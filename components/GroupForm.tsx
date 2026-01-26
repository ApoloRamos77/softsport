
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

const GroupForm: React.FC<GroupFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [nombre, setNombre] = useState('');
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [horario, setHorario] = useState('');
  const [servicios, setServicios] = useState<Servicio[]>([]);

  useEffect(() => {
    // Cargar servicios
    fetch('http://localhost:5081/api/servicios')
      .then(res => res.json())
      .then(data => setServicios(data))
      .catch(err => console.error('Error cargando servicios:', err));

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
    <div className="max-w-lg mx-auto">
      <div className="bg-[#1a2332] rounded-lg shadow-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-6 text-white">Nuevo Grupo</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Nombre del Grupo *</label>
            <input 
              type="text" 
              className="bg-[#0f1419] p-3 rounded-md border border-blue-500 text-white w-full focus:outline-none focus:border-blue-400 placeholder:text-slate-600"
              placeholder="Ej: Sub-8"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Servicio *</label>
            <select 
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-slate-400 w-full focus:outline-none focus:border-blue-500 appearance-none"
              style={{ 
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
                backgroundSize: '1.5rem', 
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat'
              }}
              value={servicioId || ''}
              onChange={(e) => setServicioId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Selecciona un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id} className="text-white">
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Horario</label>
            <textarea 
              rows={4}
              className="bg-[#0f1419] p-3 rounded-md border border-slate-700 text-white w-full resize-none focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              placeholder="Ej: Lun-Mié-Vie 3:00 PM"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
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
              className="px-8 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-medium text-sm shadow-lg shadow-blue-500/20"
            >
              {isEditing ? 'Guardar Cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupForm;
