
import React, { useState, useEffect } from 'react';
import SeasonForm from './SeasonForm';
import { Season, apiService } from '../services/api';

const SeasonManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Record<number, { trainings: number, games: number }>>({});

  const loadSeasons = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAll<Season>('seasons');
      // Filtrar temporadas anuladas
      const activeSeasons = data.filter(s => !s.fechaAnulacion);
      setSeasons(activeSeasons);

      // Load stats for each season
      activeSeasons.forEach(async (season) => {
        if (season.id) {
          try {
            const dashboardData = await apiService.getDashboardStats(season.id);
            setStats(prev => ({
              ...prev,
              [season.id!]: {
                trainings: dashboardData.topStats.entrenamientos || 0,
                games: dashboardData.topStats.partidosJugados || 0
              }
            }));
          } catch (e) {
            console.error(`Error loading stats for season ${season.id}:`, e);
          }
        }
      });
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
    setShowForm(false);
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Temporadas</h2>
            <p className="text-secondary mb-0 small">Gestiona las temporadas de tu academia</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nueva Temporada
            </button>
          </div>
        </div>

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5 text-secondary">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="mb-0">Cargando temporadas...</p>
            </div>
          ) : seasons.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="d-flex flex-column align-items-center">
                <i className="bi bi-calendar-event text-secondary display-4 mb-3"></i>
                <p className="text-white fw-medium mb-1">No hay temporadas creadas</p>
                <p className="text-secondary small mb-3">Crea tu primera temporada para organizar tus entrenamientos y juegos</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-sm btn-primary"
                  style={{ backgroundColor: '#1f6feb' }}
                >
                  Crear Temporada
                </button>
              </div>
            </div>
          ) : (
            seasons.map((season) => (
              <div key={season.id} className="col-12">
                <div
                  className="card border-0 rounded-3 shadow-lg"
                  style={{
                    backgroundColor: '#161b22',
                    border: '1px solid rgba(48, 54, 61, 0.5) !important'
                  }}
                >
                  <div className="card-body p-4">
                    {/* Top: Name and Actions */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h3 className="h5 fw-bold text-white mb-1">{season.nombre}</h3>
                        <div className="d-flex align-items-center text-secondary small">
                          <i className="bi bi-calendar3 me-2" style={{ fontSize: '0.9rem' }}></i>
                          <span>
                            {season.fechaInicio ? new Date(season.fechaInicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} - {season.fechaFin ? new Date(season.fechaFin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleEdit(season)}
                          className="btn btn-sm text-secondary hover-text-white p-0 border-0 bg-transparent"
                          title="Editar"
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(season)}
                          className="btn btn-sm text-secondary hover-text-danger p-0 border-0 bg-transparent"
                          title="Anular"
                        >
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </div>
                    </div>

                    {/* Bottom: Stats */}
                    <div className="row mt-4 pt-3 border-top border-secondary border-opacity-10">
                      <div className="col-md-6 d-flex align-items-center gap-3 mb-3 mb-md-0">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: '40px', height: '40px', backgroundColor: 'rgba(48, 54, 61, 0.3)' }}
                        >
                          <i className="bi bi-clipboard2-pulse text-secondary fs-5"></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-baseline gap-2">
                            <span className="h4 fw-bold text-white mb-0">{stats[season.id!]?.trainings || 0}</span>
                            <span className="text-secondary small">Entrenamientos</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 d-flex align-items-center gap-3">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: '40px', height: '40px', backgroundColor: 'rgba(48, 54, 61, 0.3)' }}
                        >
                          <i className="bi bi-trophy text-secondary fs-5"></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-baseline gap-2">
                            <span className="h4 fw-bold text-white mb-0">{stats[season.id!]?.games || 0}</span>
                            <span className="text-secondary small">Juegos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonManagement;
