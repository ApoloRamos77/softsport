import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import { apiService, Alumno, Categoria } from '../services/api';

interface GameFormProps {
  onCancel: () => void;
  onSubmit: (gameData: any) => void;
  initialData?: any;
  isEditing?: boolean;
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
  const [scoreLocal, setScoreLocal] = useState<number | ''>('');
  const [scoreVisitante, setScoreVisitante] = useState<number | ''>('');
  const [selectedAlumnos, setSelectedAlumnos] = useState<number[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlumnoSelector, setShowAlumnoSelector] = useState(false);
  const [includeOtherCategories, setIncludeOtherCategories] = useState(false);
  const [additionalCategories, setAdditionalCategories] = useState<number[]>([]);

  useEffect(() => {
    // Cargar categorías y alumnos usando apiService
    const loadData = async () => {
      try {
        const [catsData, alumnosResponse] = await Promise.all([
          apiService.getAll<Categoria>('categorias'),
          apiService.getPaginated<Alumno>('alumnos', { pageSize: 1000 }) // Cargar todos los alumnos
        ]);
        setCategorias(catsData);
        setAlumnos(alumnosResponse.data); // Extraer el array data de la respuesta paginada
      } catch (err) {
        console.error('Error cargando datos para el formulario:', err);
        // Asegurar que alumnos sea siempre un array vacío en caso de error
        setAlumnos([]);
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
      setObservaciones(initialData.observaciones || '');
      setScoreLocal(initialData.scoreLocal !== undefined && initialData.scoreLocal !== null ? initialData.scoreLocal : '');
      setScoreVisitante(initialData.scoreVisitante !== undefined && initialData.scoreVisitante !== null ? initialData.scoreVisitante : '');
      setSelectedAlumnos(initialData.alumnosConvocadosIds || []);
    }
  }, [initialData]);

  useEffect(() => {
    // Filtrar alumnos por categoría y término de búsqueda
    // Asegurar que alumnos sea un array válido
    let filtered = Array.isArray(alumnos) ? alumnos : [];

    // Filtrar solo alumnos activos (sin fecha de anulación)
    filtered = filtered.filter(a => !a.fechaAnulacion);

    // Filtrar por categorías (principal + adicionales si están habilitadas)
    const categoriasAIncluir = includeOtherCategories
      ? [categoriaId, ...additionalCategories].filter((id): id is number => id !== null && id !== undefined)
      : categoriaId ? [categoriaId] : [];

    if (categoriasAIncluir.length > 0) {
      filtered = filtered.filter(a =>
        a.categoriaId && categoriasAIncluir.includes(a.categoriaId)
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(a =>
        `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlumnos(filtered);
  }, [alumnos, categoriaId, includeOtherCategories, additionalCategories, searchTerm]);

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
      scoreLocal: scoreLocal === '' ? null : Number(scoreLocal),
      scoreVisitante: scoreVisitante === '' ? null : Number(scoreVisitante),
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

            {/* Selector de categorías adicionales */}
            {categoriaId && (
              <div className="space-y-2 mt-2">
                <div className="form-check">
                  <input
                    className="form-check-input bg-[#0d1117] border-secondary border-opacity-25"
                    type="checkbox"
                    id="includeOtherCategories"
                    checked={includeOtherCategories}
                    onChange={(e) => setIncludeOtherCategories(e.target.checked)}
                  />
                  <label className="form-check-label text-white text-sm" htmlFor="includeOtherCategories">
                    Incluir alumnos de otras categorías
                  </label>
                </div>

                {includeOtherCategories && (
                  <div className="mt-2">
                    <label className="text-secondary small fw-bold mb-1 d-block" style={{ fontSize: '10px' }}>CATEGORÍAS ADICIONALES (Ctrl + Click para múltiple)</label>
                    <select
                      multiple
                      className="form-select border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] p-2"
                      style={{ height: '100px' }}
                      value={additionalCategories.map(String)}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
                        setAdditionalCategories(values);
                      }}
                    >
                      {categorias
                        .filter(cat => cat.id !== categoriaId)
                        .map(cat => (
                          <option key={cat.id} value={cat.id} className="p-1">{cat.nombre}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            )}

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

            {/* Sección de Marcador */}
            <div className="grid grid-cols-2 gap-4 bg-[#111827] p-3 rounded-lg border border-slate-800">
              <div className="space-y-1">
                <label className="text-secondary small fw-bold mb-0 d-block text-uppercase text-center" style={{ fontSize: '10px' }}>Marcador Local</label>
                <input
                  type="number"
                  min="0"
                  className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] text-center font-bold"
                  value={scoreLocal}
                  onChange={(e) => setScoreLocal(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="-"
                />
              </div>
              <div className="space-y-1">
                <label className="text-secondary small fw-bold mb-0 d-block text-uppercase text-center" style={{ fontSize: '10px' }}>Marcador Visitante</label>
                <input
                  type="number"
                  min="0"
                  className="form-control border-secondary border-opacity-25 text-white w-full text-sm bg-[#0d1117] text-center font-bold"
                  value={scoreVisitante}
                  onChange={(e) => setScoreVisitante(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="-"
                />
              </div>
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
                <div className="bg-[#111827] border border-slate-700 rounded-lg p-4 space-y-3 mt-2 shadow-lg animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Buscar alumno..."
                    className="form-input-dark p-2 rounded-md border border-slate-700 text-white w-full text-sm bg-[#0d1117] focus:border-blue-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="max-h-60 overflow-y-auto space-y-0 custom-scrollbar border border-slate-800 rounded bg-[#0d1117]">
                    {/* Renderizado simplificado y directo para evitar errores */}
                    {!filteredAlumnos || filteredAlumnos.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">
                        {categoriaId ? 'No hay alumnos disponibles con los filtros actuales' : 'Selecciona una categoría primero'}
                      </p>
                    ) : (
                      // Renderizado directo de la lista agrupada
                      Object.entries(
                        filteredAlumnos.reduce((acc, alumno) => {
                          if (!alumno) return acc;
                          const catName = alumno.categoria?.nombre || 'Sin categoría';
                          if (!acc[catName]) acc[catName] = [];
                          acc[catName].push(alumno);
                          return acc;
                        }, {} as Record<string, typeof filteredAlumnos>)
                      ).map(([catName, alumnosGrupo]) => (
                        <div key={catName} className="border-b border-slate-800 last:border-0">
                          <h6 className="text-xs font-bold text-blue-400 px-3 py-2 bg-[#111827] sticky top-0 z-10 border-b border-slate-800">
                            {catName}
                          </h6>
                          <div className="divide-y divide-slate-800/50">
                            {alumnosGrupo.map(alumno => (
                              <label
                                key={alumno.id}
                                className={`flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedAlumnos.includes(alumno.id!) ? 'bg-blue-900/10' : ''}`}
                              >
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedAlumnos.includes(alumno.id!)}
                                    onChange={() => alumno.id && toggleAlumno(alumno.id)}
                                    className="peer w-4 h-4 rounded border-slate-600 bg-[#0d1117] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                  />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-sm truncate ${selectedAlumnos.includes(alumno.id!) ? 'text-blue-200' : 'text-slate-300'}`}>
                                    {(alumno as any).Nombre || alumno.nombre} {(alumno as any).Apellido || alumno.apellido}
                                  </span>
                                  {alumno.posicion && (
                                    <span className="text-[10px] text-gray-500 truncate">{alumno.posicion}</span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedAlumnos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800 animate-fadeIn">
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    {selectedAlumnos.length} alumno(s) seleccionado(s):
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {/* Usar 'alumnos' global para mostrar seleccionados aunque no estén en el filtro actual */}
                    {(Array.isArray(alumnos) ? alumnos : [])
                      .filter(a => a.id && selectedAlumnos.includes(a.id))
                      .map(alumno => (
                        <span
                          key={alumno.id}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm border border-blue-500 transition-all hover:bg-blue-700"
                        >
                          {(alumno as any).Nombre || alumno.nombre} {(alumno as any).Apellido || alumno.apellido}
                          <button
                            type="button"
                            onClick={() => alumno.id && toggleAlumno(alumno.id)}
                            className="ml-2 text-blue-100 hover:text-white focus:outline-none rounded-full p-0.5 hover:bg-blue-500/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4"
                style={{ fontWeight: '600', color: '#8b949e', borderColor: '#30363d' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2 px-4"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
              >
                {isEditing ? (
                  <>
                    <i className="bi bi-check-lg"></i> Guardar Cambios
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg"></i> Crear Juego
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div >
    </div >
  );
};

export default GameForm;
