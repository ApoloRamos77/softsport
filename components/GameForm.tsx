import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

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

interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  categoriaId?: number;
}

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
    // Cargar categorías
    fetch('http://localhost:5081/api/categorias')
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(err => console.error('Error cargando categorías:', err));

    // Cargar alumnos
    fetch('http://localhost:5081/api/alumnos')
      .then(res => res.json())
      .then(data => setAlumnos(data))
      .catch(err => console.error('Error cargando alumnos:', err));

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
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#0d1117] rounded-lg shadow-2xl border border-slate-800 overflow-hidden animate-fadeIn">
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
          <p className="text-[11px] text-slate-500 mt-1">Completa la información del juego programado</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300">Fecha</label>
              <DatePicker 
                value={gameDate}
                onChange={setGameDate}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-slate-300">Hora</label>
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

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Categoría</label>
            <select 
              className="form-input-dark p-2.5 rounded-md border border-slate-800 text-slate-400 w-full text-sm appearance-none bg-[#111827]"
              value={categoriaId || ''}
              onChange={(e) => setCategoriaId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} className="text-white">{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-white">Juego de Local</p>
              <p className="text-[11px] text-slate-500">¿Este juego es en casa?</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsHomeGame(!isHomeGame)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isHomeGame ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHomeGame ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Equipo Local</label>
            <input
              type="text"
              className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white w-full text-sm bg-[#111827]"
              value={equipoLocal}
              onChange={(e) => setEquipoLocal(e.target.value)}
              placeholder="ADHSOFT SPORT"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Equipo Visitante</label>
            <input
              type="text"
              className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white w-full text-sm bg-[#111827] placeholder:text-slate-500"
              value={equipoVisitante}
              onChange={(e) => setEquipoVisitante(e.target.value)}
              placeholder="Nombre del equipo visitante"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Ubicación</label>
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                className="form-input-dark p-2.5 pl-10 rounded-md border border-slate-800 text-white w-full text-sm bg-[#111827] placeholder:text-slate-500"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Nombre del lugar del juego"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-300">Observaciones</label>
            <textarea
              className="form-input-dark p-2.5 rounded-md border border-slate-800 text-white w-full text-sm bg-[#111827] placeholder:text-slate-500 min-h-[100px]"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales del juego"
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
                          className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-slate-700"
                        />
                        <span className="text-sm text-white">{alumno.nombre} {alumno.apellido}</span>
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
  );
};

export default GameForm;
