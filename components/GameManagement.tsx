import React, { useState, useEffect } from 'react';
import GameForm from './GameForm';
import { Game, apiService } from '../services/api';

const GameManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Game>('games');
      setGames(data);
    } catch (error) {
      console.error('Error cargando juegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (gameData: any) => {
    try {
      if (editingGame) {
        await apiService.update('games', editingGame.id!, {
          ...gameData,
          id: editingGame.id
        });
      } else {
        await apiService.create('games', gameData);
      }

      await loadGames();
      setShowForm(false);
      setEditingGame(null);
    } catch (error: any) {
      alert(error.message || 'Error al guardar el juego');
      console.error('Error:', error);
    }
  };

  const handleEdit = async (gameId: number) => {
    try {
      const data = await apiService.getById<Game>('games', gameId);
      setEditingGame(data);
      setShowForm(true);
    } catch (error) {
      console.error('Error cargando juego:', error);
      alert('Error al cargar el juego');
    }
  };

  const handleDelete = async (gameId: number) => {
    if (!confirm('¿Estás seguro de eliminar este juego?')) return;

    try {
      await apiService.delete('games', gameId);
      await loadGames();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el juego');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGame(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameStatus = (fecha?: string) => {
    if (!fecha) return 'Pendiente';
    const gameDate = new Date(fecha);
    const now = new Date();

    if (gameDate > now) return 'Programado';
    return 'Finalizado';
  };

  const getGameResult = (game: Game) => {
    if (game.scoreLocal === null || game.scoreLocal === undefined ||
      game.scoreVisitante === null || game.scoreVisitante === undefined) {
      return '-';
    }
    return `${game.scoreLocal} - ${game.scoreVisitante}`;
  };

  const filteredGames = games.filter(g => {
    // Buscar
    const term = searchTerm.toLowerCase();
    const matchSearch = g.equipoLocal?.toLowerCase().includes(term) ||
      g.equipoVisitante?.toLowerCase().includes(term) ||
      g.ubicacion?.toLowerCase().includes(term) ||
      g.titulo?.toLowerCase().includes(term);

    if (!matchSearch) return false;

    // Categoría
    if (categoriaFiltro !== 'Todas' && g.categoriaNombre !== categoriaFiltro) return false;

    return true;
  });

  if (showForm) {
    return (
      <GameForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialData={editingGame}
        isEditing={!!editingGame}
      />
    );
  }

  // Calcular estadísticas
  const totalGames = games.length;
  const upcomingGames = games.filter(g => g.fecha && new Date(g.fecha) > new Date()).length;
  const finishedGames = games.filter(g =>
    g.scoreLocal !== null && g.scoreLocal !== undefined &&
    g.scoreVisitante !== null && g.scoreVisitante !== undefined
  );
  const wins = finishedGames.filter(g => (g.scoreLocal || 0) > (g.scoreVisitante || 0)).length;
  const draws = finishedGames.filter(g => g.scoreLocal === g.scoreVisitante).length;
  const losses = finishedGames.filter(g => (g.scoreLocal || 0) < (g.scoreVisitante || 0)).length;
  const winRate = finishedGames.length > 0 ? ((wins / finishedGames.length) * 100).toFixed(0) : 0;

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Juegos</h2>
            <p className="text-secondary mb-0 small">Planifica y registra los encuentros deportivos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Juego
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-2 border-secondary border-opacity-10 shadow-lg" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3">
            <div className="row g-2 align-items-center">
              <div className="col-lg-4 col-md-5">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}></i>
                  <input
                    type="text"
                    placeholder="Buscar equipo o ubicación..."
                    className="form-control form-control-sm"
                    style={{ paddingLeft: '2.3rem', height: '38px', fontSize: '13px' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-8 col-md-7">
                <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                  <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                    <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider ps-1">Categoría</span>
                    <select
                      className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer pe-1"
                      value={categoriaFiltro}
                      onChange={e => setCategoriaFiltro(e.target.value)}
                    >
                      <option style={{ backgroundColor: '#161b22' }}>Todas</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-8</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-10</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-12</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-15</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-17</option>
                      <option style={{ backgroundColor: '#161b22' }}>Sub-20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Total Juegos</p>
                <h3 className="fw-bold mb-1 text-white">{totalGames}</h3>
                <small className="text-secondary opacity-75">Esta temporada</small>
                <i className="bi bi-trophy position-absolute end-0 top-0 m-3 text-secondary opacity-10 fs-1"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Próximos Juegos</p>
                <h3 className="fw-bold mb-1 text-primary">{upcomingGames}</h3>
                <small className="text-secondary opacity-75">Programados</small>
                <i className="bi bi-calendar-event position-absolute end-0 top-0 m-3 text-primary opacity-10 fs-1"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Tasa de Victoria</p>
                <h3 className="fw-bold mb-1 text-success">{winRate}%</h3>
                <small className="text-secondary opacity-75">Promedio general</small>
                <i className="bi bi-graph-up-arrow position-absolute end-0 top-0 m-3 text-success opacity-10 fs-1"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome Stats */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 border-start border-4 border-success shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden py-3">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px' }}>Victorias</p>
                <h4 className="fw-bold text-success mb-0">{wins}</h4>
                <i className="bi bi-trophy-fill position-absolute end-0 top-0 m-2 text-success opacity-10 fs-2"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 border-start border-4 border-primary shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden py-3">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px' }}>Empates</p>
                <h4 className="fw-bold text-primary mb-0">{draws}</h4>
                <i className="bi bi-circle-half position-absolute end-0 top-0 m-2 text-primary opacity-10 fs-2"></i>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card h-100 border-0 border-start border-4 border-danger shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body position-relative overflow-hidden py-3">
                <p className="text-secondary text-uppercase small fw-bold mb-1" style={{ fontSize: '10px' }}>Derrotas</p>
                <h4 className="fw-bold text-danger mb-0">{losses}</h4>
                <i className="bi bi-x-circle-fill position-absolute end-0 top-0 m-2 text-danger opacity-10 fs-2"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3 px-4">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fs-6 fw-bold text-white">Listado de Juegos</h5>
              <small className="text-secondary opacity-75">Historial completo</small>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
              <thead style={{ backgroundColor: '#161b22' }}>
                <tr>
                  <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Fecha</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Equipos</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Ubicación</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Categoría</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 text-center">Convocados</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Estado</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 text-center">Resultado</th>
                  <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-secondary">
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mb-0">Cargando...</p>
                    </td>
                  </tr>
                ) : filteredGames.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <p className="text-muted mb-0">No hay juegos registrados</p>
                    </td>
                  </tr>
                ) : (
                  filteredGames.map((game) => (
                    <tr key={game.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                      <td className="ps-4 fw-semibold text-nowrap text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        {formatDate(game.fecha)}
                      </td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-white mb-0" style={{ fontSize: '13px' }}>{game.equipoLocal || 'Local'}</span>
                          <small className="text-secondary opacity-75">vs {game.equipoVisitante || 'Visitante'}</small>
                        </div>
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        {game.ubicacion || '-'}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        {game.categoriaNombre || '-'}
                      </td>
                      <td className="text-center border-bottom border-secondary border-opacity-10 py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3">
                          {game.alumnosConvocados?.length || 0}
                        </span>
                      </td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <span className={`badge border border-opacity-30 text-white ${getGameStatus(game.fecha) === 'Programado'
                          ? 'bg-primary bg-opacity-20 border-primary'
                          : 'bg-secondary bg-opacity-20 border-secondary'
                          }`}>
                          {getGameStatus(game.fecha)}
                        </span>
                      </td>
                      <td className="fw-bold text-center border-bottom border-secondary border-opacity-10 py-3">
                        <span className="text-white" style={{ letterSpacing: '2px' }}>{getGameResult(game)}</span>
                      </td>
                      <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleEdit(game.id)}
                            className="btn btn-sm text-primary p-0 me-2"
                            title="Editar"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(game.id)}
                            className="btn btn-sm text-danger p-0"
                            title="Eliminar"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameManagement;
