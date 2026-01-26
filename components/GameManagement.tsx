
import React, { useState, useEffect } from 'react';
import GameForm from './GameForm';

interface Game {
  id: number;
  titulo?: string;
  fecha?: string;
  categoriaId?: number;
  categoriaNombre?: string;
  esLocal: boolean;
  equipoLocal?: string;
  equipoVisitante?: string;
  ubicacion?: string;
  observaciones?: string;
  scoreLocal?: number;
  scoreVisitante?: number;
  alumnosConvocados?: any[];
}

const GameManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/games');
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error cargando juegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (gameData: any) => {
    try {
      const url = editingGame ? `http://localhost:5081/api/games/${editingGame.id}` : 'http://localhost:5081/api/games';
      const method = editingGame ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al guardar el juego');
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
      const response = await fetch(`http://localhost:5081/api/games/${gameId}`);
      const data = await response.json();
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
      const response = await fetch(`http://localhost:5081/api/games/${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el juego');
      }

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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Juegos</h2>
          <p className="text-sm text-slate-400">Gestión de partidos y competencias</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors w-fit shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nuevo Juego
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg relative overflow-hidden">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 font-bold mb-1">Total Juegos</p>
            <h3 className="text-2xl font-bold">{totalGames}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Esta temporada</p>
          </div>
          <i className="fas fa-trophy absolute right-4 top-4 text-slate-700/50 text-xl"></i>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg relative overflow-hidden">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 font-bold mb-1">Próximos Juegos</p>
            <h3 className="text-2xl font-bold">{upcomingGames}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Programados</p>
          </div>
          <i className="fas fa-calendar-alt absolute right-4 top-4 text-slate-700/50 text-xl"></i>
        </div>
        <div className="bg-[#111827] border border-slate-800 p-5 rounded-lg relative overflow-hidden">
          <div className="flex flex-col">
            <p className="text-xs text-slate-400 font-bold mb-1">Tasa de Victoria</p>
            <h3 className="text-2xl font-bold">{winRate}%</h3>
            <p className="text-[10px] text-slate-500 mt-1">Promedio general</p>
          </div>
          <i className="fas fa-trophy absolute right-4 top-4 text-slate-700/50 text-xl"></i>
        </div>
      </div>

      {/* Outcome Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-slate-800 border-l-4 border-l-green-600 p-5 rounded-lg relative overflow-hidden">
          <p className="text-xs text-slate-400 font-bold mb-1">Victorias</p>
          <h3 className="text-2xl font-bold text-green-500">{wins}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Juegos ganados</p>
          <i className="fas fa-trophy absolute right-4 top-4 text-green-900/20 text-xl"></i>
        </div>
        <div className="bg-[#111827] border border-slate-800 border-l-4 border-l-blue-600 p-5 rounded-lg relative overflow-hidden">
          <p className="text-xs text-slate-400 font-bold mb-1">Empates</p>
          <h3 className="text-2xl font-bold text-blue-500">{draws}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Juegos empatados</p>
          <i className="fas fa-trophy absolute right-4 top-4 text-blue-900/20 text-xl"></i>
        </div>
        <div className="bg-[#111827] border border-slate-800 border-l-4 border-l-red-600 p-5 rounded-lg relative overflow-hidden">
          <p className="text-xs text-slate-400 font-bold mb-1">Derrotas</p>
          <h3 className="text-2xl font-bold text-red-500">{losses}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Juegos perdidos</p>
          <i className="fas fa-trophy absolute right-4 top-4 text-red-900/20 text-xl"></i>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-900/30">
          <h3 className="text-sm font-bold">Listado de Juegos</h3>
          <p className="text-[10px] text-slate-500 mt-1">Historial completo de partidos y competencias</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-slate-500 uppercase bg-slate-900/10 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4 font-semibold">Fecha</th>
                <th className="px-5 py-4 font-semibold">Equipos</th>
                <th className="px-5 py-4 font-semibold">Ubicación</th>
                <th className="px-5 py-4 font-semibold">Categoría</th>
                <th className="px-5 py-4 font-semibold">Convocados</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Resultado</th>
                <th className="px-5 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-24 text-center">
                    <p className="text-sm text-slate-600">Cargando...</p>
                  </td>
                </tr>
              ) : games.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-24 text-center">
                    <p className="text-sm text-slate-600 italic">No hay juegos registrados</p>
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="border-b border-slate-800 hover:bg-slate-900/20 transition-colors">
                    <td className="px-5 py-4 text-white whitespace-nowrap">
                      {formatDate(game.fecha)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{game.equipoLocal || 'Local'}</span>
                        <span className="text-slate-500 text-[10px]">vs {game.equipoVisitante || 'Visitante'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {game.ubicacion || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {game.categoriaNombre || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {game.alumnosConvocados?.length || 0} alumnos
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        getGameStatus(game.fecha) === 'Programado' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                      }`}>
                        {getGameStatus(game.fecha)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white font-semibold">
                      {getGameResult(game)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(game.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(game.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
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
  );
};

export default GameManagement;
