import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import { apiService, Alumno } from '../services/api';

interface GameFormProps {
  onCancel: () => void;
  onSubmit: (gameData: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}

// Alumno interface is now imported from ../services/api

const GameForm: React.FC<GameFormProps> = ({ onCancel, onSubmit, initialData, isEditing = false }) => {
  const [isHomeGame, setIsHomeGame] = useState(true);
  const [gameDate, setGameDate] = useState('');
  const [hour, setHour] = useState('--');
  const [minute, setMinute] = useState('--');
  const [period, setPeriod] = useState('AM');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [equipoLocal, setEquipoLocal] = useState('ADHSOFT SPORT');
  const [equipoVisitante, setEquipoVisitante] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [selectedAlumnos, setSelectedAlumnos] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlumnoSelector, setShowAlumnoSelector] = useState(false);

  useEffect(() => {
    // Cargar categorías y alumnos usando apiService
    const loadData = async () => {
      try {
        const [catsData, alumnosData] = await Promise.all([
          apiService.getAll<Categoria>('categorias'),
          apiService.getAll<Alumno>('alumnos')
        ]);
        setCategorias(catsData);
        setAlumnos(alumnosData);
      } catch (err) {
        console.error('Error cargando datos para el formulario:', err);
      }
    };
    loadData();

    // Si hay datos iniciales (edición), cargarlos
    if (initialData) {
      setGameDate(initialData.fecha ? new Date(initialData.fecha).toISOString().split('T')[0] : '');
      if (initialData.fecha) {
        const date = new Date(initialData.fecha);
        let hours = date.getHours();
        const mins = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setHour(hours.toString());
        setMinute(mins.toString().padStart(2, '0'));
        setPeriod(ampm);
      }
      setCategoriaId(initialData.categoriaId || null);
      setIsHomeGame(initialData.esLocal !== undefined ? initialData.esLocal : true);
      setEquipoLocal(initialData.equipoLocal || 'ADHSOFT SPORT');
      setEquipoVisitante(initialData.equipoVisitante || '');
      setUbicacion(initialData.ubicacion || '');
      setObservaciones(initialData.observaciones || '');
      setSelectedAlumnos(initialData.alumnosConvocadosIds || []);
    }
  }, [initialData]);

  useEffect(() => {
    // Filtrar alumnos por categoría y término de búsqueda
    let filtered = alumnos;
    if (categoriaId) {
      filtered = filtered.filter(a => a.categoriaId === categoriaId);
    }
    if (searchTerm) {
      filtered = filtered.filter(a =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAlumnos(filtered);
  }, [alumnos, categoriaId, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAlumnos.length === 0) {
      alert('Debes convocar al menos un alumno');
      return;
    }

    if (!gameDate || hour === '--' || minute === '--') {
      alert('Por favor completa la fecha y hora del juego');
      return;
    }

    if (!categoriaId) {
      alert('Por favor selecciona una categoría');
      return;
    }

    // Construir la fecha completa
    let hours = parseInt(hour);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const gameDateTime = new Date(gameDate);
    gameDateTime.setHours(hours, parseInt(minute), 0);

    const gameData = {
      fecha: gameDateTime.toISOString(),
      categoriaId,
      esLocal: isHomeGame,
      equipoLocal,
      equipoVisitante,
      ubicacion,
      observaciones,
      alumnosConvocadosIds: selectedAlumnos,
      titulo: `${equipoLocal} vs ${equipoVisitante}` // Generar título automáticamente
    };

    onSubmit(gameData);
  };

  const toggleAlumno = (alumnoId: number) => {
    if (selectedAlumnos.includes(alumnoId)) {
      setSelectedAlumnos(selectedAlumnos.filter(id => id !== alumnoId));
    } else {
      setSelectedAlumnos([...selectedAlumnos, alumnoId]);
    }
  };

  const getAlumnoNombre = (alumnoId: number) => {
    const alumno = alumnos.find(a => a.id === alumnoId);
    if (!alumno) return '';
    const nombre = (alumno as any).Nombre || alumno.nombre;
    const apellido = (alumno as any).Apellido || alumno.apellido;
    return `${nombre} ${apellido}`;
  };

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh', padding: '20px 0' }}>
      <div className="max-w-2xl mx-auto bg-[#161b22] rounded-xl shadow-2xl border border-secondary border-opacity-10 overflow-hidden">
        <div className="p-5 p-md-5 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{isEditing ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
            <p className="text-[11px] text-secondary">Completa la información del juego programado</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Fecha</label>
                <DatePicker
                  value={gameDate}
                  onChange={setGameDate}
                  placeholder="Seleccionar fecha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Hora</label>
                <div className="flex items-center gap-2">
                  <select
                    className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white text-sm bg-[#111827] flex-1"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                  >
                    <option>--</option>
                    {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                  </select>
                  <span className="text-slate-500 self-center">:</span>
                  <select
                    className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white text-sm bg-[#111827] flex-1"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                  >
                    <option>--</option>
                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white text-sm bg-[#111827] w-20"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Categoría</label>
              <select
                className="form-select border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] p-2.5"
                value={categoriaId || ''}
                onChange={(e) => setCategoriaId(e.target.value ? parseInt(e.target.value) : null)}
                style={{ backgroundColor: '#0d1117', color: 'white' }}
              >
                <option value="" style={{ backgroundColor: '#0d1117' }}>Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id} style={{ backgroundColor: '#0d1117' }}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#0d1117] border border-secondary border-opacity-25 rounded-lg p-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white mb-0">Juego de Local</p>
                <p className="text-[11px] text-secondary mb-0">¿Este juego es en casa?</p>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={isHomeGame}
                  onChange={() => setIsHomeGame(!isHomeGame)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Equipo Local</label>
              <input
                type="text"
                className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117]"
                value={equipoLocal}
                onChange={(e) => setEquipoLocal(e.target.value)}
                placeholder="ADHSOFT SPORT"
              />
            </div>

            <div className="space-y-2">
              <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Equipo Visitante</label>
              <input
                type="text"
                className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] placeholder-secondary"
                value={equipoVisitante}
                onChange={(e) => setEquipoVisitante(e.target.value)}
                placeholder="Nombre del equipo visitante"
              />
            </div>

            <div className="space-y-2">
              <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Ubicación</label>
              <div className="position-relative">
                <i className="bi bi-geo-alt position-absolute text-secondary" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}></i>
                <input
                  type="text"
                  className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] placeholder-secondary"
                  style={{ paddingLeft: '2.5rem' }}
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Nombre del lugar del juego"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-secondary small fw-bold mb-0 d-block text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Observaciones</label>
              <textarea
                className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] placeholder-secondary min-h-[80px]"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-slate-300">
                  Convocatoria <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAlumnoSelector(!showAlumnoSelector)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {showAlumnoSelector ? 'Ocultar selección' : 'Seleccionar alumnos'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Selecciona al menos un alumno convocado para este juego</p>

              {selectedAlumnos.length === 0 && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded-md p-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Debes convocar al menos un alumno
                </div>
              )}

              {showAlumnoSelector && (
                <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Buscar alumno..."
                    className="form-input-dark p-2 rounded-md border border-slate-800 text-white w-full text-sm bg-[#0d1117]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredAlumnos.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        {categoriaId ? 'No hay alumnos en esta categoría' : 'Selecciona una categoría primero'}
                      </p>
                    ) : (
                      filteredAlumnos.map(alumno => (
                        <label
                          key={alumno.id}
                          className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAlumnos.includes(alumno.id)}
                            onChange={() => toggleAlumno(alumno.id)}
                            className="w-4 h-4 rounded border-secondary border-opacity-30 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-[#0d1117]"
                          />
                          <span className="text-sm text-white">{(alumno as any).Nombre || alumno.nombre} {(alumno as any).Apellido || alumno.apellido}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedAlumnos.length > 0 && (
                <div className="bg-[#111827] border border-slate-800 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-2">{selectedAlumnos.length} alumno(s) seleccionado(s):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumnos.map(alumnoId => (
                      <span
                        key={alumnoId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300"
                      >
                        {getAlumnoNombre(alumnoId)}
                        <button
                          type="button"
                          onClick={() => toggleAlumno(alumnoId)}
                          className="hover:text-blue-100"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-bold text-white hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold text-sm"
              >
                {isEditing ? 'Guardar Cambios' : 'Crear Juego'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameForm;
