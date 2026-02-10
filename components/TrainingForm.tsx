
import React, { useState, useEffect } from 'react';
import TacticalPlaysModal from './TacticalPlaysModal';
import DatePicker from './DatePicker';
import { apiService, Categoria, Training, Personal } from '../services/api';

interface TrainingFormProps {
  training?: Training | null;
  onCancel: () => void;
  onSave: () => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ training, onCancel, onSave }) => {
  const [showTacticalModal, setShowTacticalModal] = useState(false);
  const [selectedPlaysCount, setSelectedPlaysCount] = useState(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [entrenadores, setEntrenadores] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    fecha: '',
    categoriaId: '',
    entrenadorId: '',
    horaInicio: { hora: '--', minuto: '--', periodo: 'AM' },
    horaFin: { hora: '--', minuto: '--', periodo: 'AM' },
    ubicacion: '',
    descripcion: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, coaches] = await Promise.all([
          apiService.getAll<Categoria>('categorias'),
          apiService.getPersonal({ cargo: 'Entrenador' })
        ]);
        setCategorias(cats);
        setEntrenadores(coaches);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
        entrenadorId: training.entrenadorId?.toString() || '',
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
      entrenadorId: formData.entrenadorId ? parseInt(formData.entrenadorId) : null,
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh', padding: '20px 0' }}>
      <div className="max-w-3xl mx-auto bg-[#161b22] rounded-xl shadow-2xl border border-secondary border-opacity-10 p-5 p-md-5">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-1">
            {training ? 'Edición de Entrenamiento' : 'Crear Nuevo Entrenamiento'}
          </h2>
          <p className="text-[11px] text-secondary">Completa la información del entrenamiento y sesiones tácticas</p>
        </div>

        <form className="d-flex flex-column gap-4" onSubmit={handleSave}>
          <div className="form-group mb-0">
            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Nombre del Entrenamiento *</label>
            <input
              type="text"
              placeholder="Ej: Entrenamiento de técnica individual"
              className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Fecha *</label>
              <DatePicker
                value={formData.fecha}
                onChange={val => setFormData({ ...formData, fecha: val })}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div className="col-md-6">
              <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Categoría *</label>
              <select
                className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117]"
                value={formData.categoriaId}
                onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                required
              >
                <option value="" style={{ backgroundColor: '#0d1117' }}>Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ backgroundColor: '#0d1117' }}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Nombre del Entrenador</label>
            <select
              className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117]"
              value={formData.entrenadorId}
              onChange={e => setFormData({ ...formData, entrenadorId: e.target.value })}
            >
              <option value="" style={{ backgroundColor: '#0d1117' }}>Seleccionar Entrenador</option>
              {entrenadores.map(coach => (
                <option key={coach.id} value={coach.id} style={{ backgroundColor: '#0d1117' }}>
                  {coach.nombres} {coach.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Hora de Inicio</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2"
                  value={formData.horaInicio.hora}
                  onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, hora: e.target.value } })}
                >
                  <option value="--">--</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h.toString().padStart(2, '0')} style={{ backgroundColor: '#0d1117' }}>{h.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-secondary align-self-center">:</span>
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2"
                  value={formData.horaInicio.minuto}
                  onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, minuto: e.target.value } })}
                >
                  <option value="--">--</option>
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m} style={{ backgroundColor: '#0d1117' }}>{m}</option>
                  ))}
                </select>
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2 w-auto"
                  value={formData.horaInicio.periodo}
                  onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, periodo: e.target.value } })}
                >
                  <option style={{ backgroundColor: '#0d1117' }}>AM</option>
                  <option style={{ backgroundColor: '#0d1117' }}>PM</option>
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Hora de Fin</label>
              <div className="d-flex gap-2">
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2"
                  value={formData.horaFin.hora}
                  onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, hora: e.target.value } })}
                >
                  <option value="--">--</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h.toString().padStart(2, '0')} style={{ backgroundColor: '#0d1117' }}>{h.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-secondary align-self-center">:</span>
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2"
                  value={formData.horaFin.minuto}
                  onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, minuto: e.target.value } })}
                >
                  <option value="--">--</option>
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m} style={{ backgroundColor: '#0d1117' }}>{m}</option>
                  ))}
                </select>
                <select
                  className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2 w-auto"
                  value={formData.horaFin.periodo}
                  onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, periodo: e.target.value } })}
                >
                  <option style={{ backgroundColor: '#0d1117' }}>AM</option>
                  <option style={{ backgroundColor: '#0d1117' }}>PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Ubicación</label>
            <div className="position-relative">
              <i className="bi bi-geo-alt position-absolute text-secondary" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}></i>
              <input
                type="text"
                placeholder="Nombre del lugar o campo"
                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Descripción / Notas</label>
            <textarea
              placeholder="Detalles de la sesión..."
              className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] placeholder-secondary min-h-[80px]"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
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
    </div>
  );
};

export default TrainingForm;
