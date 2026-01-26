
import React, { useState, useEffect } from 'react';
import SeasonForm from './SeasonForm';
import { Season, apiService } from '../services/api';

const SeasonManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSeasons = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAll<Season>('seasons');
      // Filtrar temporadas anuladas
      const activesSeasons = data.filter(s => !s.fechaAnulacion);
      setSeasons(activesSeasons);
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleSave = () => {
    setEditingSeason(null);
    loadSeasons();
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setShowForm(true);
  };

  const handleDelete = async (season: Season) => {
    if (!confirm(`¿Está seguro que desea anular la temporada "${season.nombre}"?`)) {
      return;
    }

    try {
      await apiService.delete('seasons', season.id!);
      loadSeasons();
    } catch (error) {
      console.error('Error al anular temporada:', error);
      alert('Error al anular la temporada');
    }
  };

  if (showForm) {
    return (
      <SeasonForm 
        season={editingSeason}
        onCancel={() => {
          setShowForm(false);
          setEditingSeason(null);
        }} 
        onSave={handleSave} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Temporadas</h2>
          <p className="text-sm text-slate-400">Gestiona las temporadas de tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nueva Temporada
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg p-20 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
        {loading ? (
          <div className="text-slate-400">
            <i className="fas fa-spinner fa-spin text-3xl"></i>
            <p className="mt-4">Cargando temporadas...</p>
          </div>
        ) : seasons.length === 0 ? (
          <>
            <div className="w-16 h-16 bg-slate-800/30 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-calendar-check text-3xl text-slate-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">No hay temporadas creadas</h3>
              <p className="text-sm text-slate-500 max-w-sm">Crea tu primera temporada para organizar tus entrenamientos y juegos</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-blue-500/20 mt-4"
            >
              <i className="fas fa-plus"></i> Crear Temporada
            </button>
          </>
        ) : (
          <div className="w-full space-y-3">
            {seasons.map((season) => (
              <div key={season.id} className="bg-[#0d1117] border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-blue-500"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{season.nombre}</h4>
                    <p className="text-xs text-slate-400">
                      {season.fechaInicio ? new Date(season.fechaInicio).toLocaleDateString() : 'Sin fecha inicio'} - {season.fechaFin ? new Date(season.fechaFin).toLocaleDateString() : 'Sin fecha fin'}
                    </p>
                    {season.fechaCreacion && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Creado: {new Date(season.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {season.usuarioCreacion && <span className="block text-[9px]">{season.usuarioCreacion}</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {season.activo && (
                    <span className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full font-bold">
                      Activa
                    </span>
                  )}
                  <button 
                    onClick={() => handleEdit(season)}
                    className="text-slate-400 hover:text-blue-500 transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(season)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Anular"
                  >
                    <i className="fas fa-ban"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonManagement;
