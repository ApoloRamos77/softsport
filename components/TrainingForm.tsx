
import React, { useState, useEffect } from 'react';
import TacticalPlaysModal from './TacticalPlaysModal';
import DatePicker from './DatePicker';
import { apiService } from '../services/api';

interface Categoria {
  id: number;
  nombre: string;
}

interface Training {
  id?: number;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  ubicacion?: string;
  categoriaId?: number;
  categoria?: Categoria;
  tipo?: string;
  estado: string;
}

interface TrainingFormProps {
  training?: Training | null;
  onCancel: () => void;
  onSave: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ training, onCancel, onSave }) => {
  const [showTacticalModal, setShowTacticalModal] = useState(false);
  const [selectedPlaysCount, setSelectedPlaysCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    fecha: '',
    categoriaId: '',
    horaInicio: { hora: '--', minuto: '--', periodo: 'AM' },
    horaFin: { hora: '--', minuto: '--', periodo: 'AM' },
    ubicacion: '',
    descripcion: ''
  });

  // Cargar categorías
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAll<Categoria>('categorias');
        setCategorias(data);
      } catch (error) {
        console.error('Error loading categorias:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCategorias();
  }, []);

  // Cargar datos del entrenamiento si está en modo edición
  useEffect(() => {
    if (training) {
      const parseTime = (timeStr?: string) => {
        if (!timeStr) return { hora: '--', minuto: '--', periodo: 'AM' };
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const isPM = hour >= 12;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return {
          hora: displayHour.toString().padStart(2, '0'),
          minuto: minutes || '00',
          periodo: isPM ? 'PM' : 'AM'
        };
      };

      setFormData({
        titulo: training.titulo || '',
        fecha: training.fecha ? training.fecha.split('T')[0] : '',
        categoriaId: training.categoriaId?.toString() || '',
        horaInicio: parseTime(training.horaInicio),
        horaFin: parseTime(training.horaFin),
        ubicacion: training.ubicacion || '',
        descripcion: training.descripcion || ''
      });
    }
  }, [training]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formatTime = (time: { hora: string; minuto: string; periodo: string }) => {
      if (time.hora === '--' || time.minuto === '--') return undefined;
      let hour = parseInt(time.hora);
      if (time.periodo === 'PM' && hour !== 12) hour += 12;
      if (time.periodo === 'AM' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${time.minuto}:00`;
    };

    const trainingData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      fecha: formData.fecha || null,
      horaInicio: formatTime(formData.horaInicio),
      horaFin: formatTime(formData.horaFin),
      ubicacion: formData.ubicacion || null,
      categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : null,
      estado: 'Programado'
    };

    try {
      if (training?.id) {
        await apiService.update('trainings', training.id, {
          ...trainingData,
          id: training.id
        });
      } else {
        await apiService.create('trainings', trainingData);
      }
      onSave();
    } catch (error) {
      console.error('Error al guardar entrenamiento:', error);
      alert('Error al guardar el entrenamiento');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#111827] rounded-lg shadow-xl border border-slate-800 p-8">
      <h2 className="text-xl font-bold mb-1 text-white">
        {training ? 'Edición de Entrenamiento' : 'Crear Nuevo Entrenamiento'}
      </h2>
      <p className="text-sm text-slate-400 mb-8">Completa la información del entrenamiento y selecciona los alumnos a convocar</p>
      
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Nombre</label>
          <input 
            type="text" 
            placeholder="Entrenamiento técnico..."
            className="form-input-dark p-3 rounded-md border text-white"
            value={formData.titulo}
            onChange={e => setFormData({...formData, titulo: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Fecha</label>
            <input
              type="date"
              className="form-input-dark p-3 rounded-md border text-white"
              value={formData.fecha}
              onChange={e => setFormData({...formData, fecha: e.target.value})}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Categoría</label>
            <select 
              className="form-input-dark p-3 rounded-md border text-white appearance-none bg-no-repeat bg-right" 
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
              value={formData.categoriaId}
              onChange={e => setFormData({...formData, categoriaId: e.target.value})}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Hora de Inicio</label>
            <div className="flex gap-2">
              <select 
                className="form-input-dark p-2 rounded border flex-1"
                value={formData.horaInicio.hora}
                onChange={e => setFormData({...formData, horaInicio: {...formData.horaInicio, hora: e.target.value}})}
              >
                <option value="--">--</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                  <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-slate-500 self-center">:</span>
              <select 
                className="form-input-dark p-2 rounded border flex-1"
                value={formData.horaInicio.minuto}
                onChange={e => setFormData({...formData, horaInicio: {...formData.horaInicio, minuto: e.target.value}})}
              >
                <option value="--">--</option>
                {['00', '15', '30', '45'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                className="form-input-dark p-2 rounded border w-20"
                value={formData.horaInicio.periodo}
                onChange={e => setFormData({...formData, horaInicio: {...formData.horaInicio, periodo: e.target.value}})}
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Hora de Fin</label>
            <div className="flex gap-2">
              <select 
                className="form-input-dark p-2 rounded border flex-1"
                value={formData.horaFin.hora}
                onChange={e => setFormData({...formData, horaFin: {...formData.horaFin, hora: e.target.value}})}
              >
                <option value="--">--</option>
                {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                  <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-slate-500 self-center">:</span>
              <select 
                className="form-input-dark p-2 rounded border flex-1"
                value={formData.horaFin.minuto}
                onChange={e => setFormData({...formData, horaFin: {...formData.horaFin, minuto: e.target.value}})}
              >
                <option value="--">--</option>
                {['00', '15', '30', '45'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select 
                className="form-input-dark p-2 rounded border w-20"
                value={formData.horaFin.periodo}
                onChange={e => setFormData({...formData, horaFin: {...formData.horaFin, periodo: e.target.value}})}
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Ubicación</label>
          <div className="relative">
            <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Nombre del lugar del entrenamiento"
              className="form-input-dark p-3 pl-10 rounded-md border text-white w-full"
              value={formData.ubicacion}
              onChange={e => setFormData({...formData, ubicacion: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" id="map" className="w-4 h-4 rounded bg-slate-800 border-slate-700" />
            <label htmlFor="map" className="text-xs text-slate-400 font-semibold cursor-pointer">Buscar en mapa</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-800">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold shadow-lg shadow-blue-500/20"
          >
            {training ? 'Guardar Cambios' : 'Crear Entrenamiento'}
          </button>
        </div>
      </form>

      {showTacticalModal && (
        <TacticalPlaysModal 
          onClose={() => setShowTacticalModal(false)} 
          onConfirm={(count) => {
            setSelectedPlaysCount(count);
            setShowTacticalModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TrainingForm;
