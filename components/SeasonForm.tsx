
import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import { Season, apiService } from '../services/api';

interface SeasonFormProps {
  season?: Season | null;
  onCancel: () => void;
  onSave?: () => void;
}

const SeasonForm: React.FC<SeasonFormProps> = ({ season, onCancel, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [dates, setDates] = useState({ inicio: '', fin: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (season) {
      setNombre(season.nombre || '');
      setIsActive(season.activo || false);
      setDates({
        inicio: season.fechaInicio ? season.fechaInicio.split('T')[0] : '',
        fin: season.fechaFin ? season.fechaFin.split('T')[0] : ''
      });
    }
  }, [season]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      alert('Por favor ingrese un nombre para la temporada');
      return;
    }

    setSaving(true);
    try {
      const seasonData = {
        nombre: nombre.trim(),
        fechaInicio: dates.inicio ? `${dates.inicio}T00:00:00` : undefined,
        fechaFin: dates.fin ? `${dates.fin}T00:00:00` : undefined,
        activo: isActive
      };
      
      if (season?.id) {
        // Modo edición
        await apiService.update('seasons', season.id, {
          ...seasonData,
          id: season.id
        });
      } else {
        // Modo creación
        await apiService.create('seasons', seasonData);
      }
      
      onSave?.();
      onCancel();
    } catch (error) {
      console.error('Error al guardar temporada:', error);
      alert('Error al guardar la temporada');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0d1117] rounded-lg shadow-2xl border border-slate-800 overflow-hidden animate-fadeIn">
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">{season?.id ? 'Editar Temporada' : 'Nueva Temporada'}</h2>
          <p className="text-[11px] text-slate-500 mt-1">{season?.id ? 'Modifica los datos de la temporada' : 'Crea una nueva temporada para organizar tus entrenamientos y juegos'}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Nombre</label>
            <input 
              type="text" 
              placeholder="Ej: Temporada 2025"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="form-input-dark p-2.5 rounded-md border border-blue-600/50 bg-[#0d1117] text-white w-full text-sm ring-2 ring-blue-500/10 focus:outline-none focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300">Fecha de Inicio</label>
              <DatePicker 
                value={dates.inicio}
                onChange={(d) => setDates({...dates, inicio: d})}
                placeholder="Seleccionar"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300">Fecha de Fin</label>
              <DatePicker 
                value={dates.fin}
                onChange={(d) => setDates({...dates, fin: d})}
                placeholder="Seleccionar"
              />
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-0.5 max-w-[70%]">
              <p className="text-sm font-bold text-white">Temporada Activa</p>
              <p className="text-[10px] text-slate-500">Marcar como la temporada activa actual (se desactivarán las demás)</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-slate-300 shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 text-xs font-bold text-white hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (season?.id ? 'Guardando...' : 'Creando...') : (season?.id ? 'Guardar Cambios' : 'Crear Temporada')}
            
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonForm;
