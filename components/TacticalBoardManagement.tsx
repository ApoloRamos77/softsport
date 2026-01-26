
import React, { useState, useEffect } from 'react';
import TacticalBoardEditor from './TacticalBoardEditor';
import { apiService, TacticalBoard } from '../services/api';

const TacticalBoardManagement: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBoard, setEditingBoard] = useState<TacticalBoard | null>(null);
  const [boards, setBoards] = useState<TacticalBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTacticalBoards();
      setBoards(data);
    } catch (error) {
      console.error('Error loading tactical boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (board: TacticalBoard) => {
    setEditingBoard(board);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingBoard(null);
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
    setEditingBoard(null);
    loadBoards();
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta jugada?')) {
      try {
        await apiService.deleteTacticalBoard(id);
        loadBoards();
      } catch (error) {
        console.error('Error deleting tactical board:', error);
      }
    }
  };

  const filteredBoards = boards.filter(board =>
    board.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return <TacticalBoardEditor board={editingBoard} onBack={handleBack} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn bg-[#1a1f2e] min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Tablero Táctico</h2>
            <p className="text-sm text-slate-400 mt-1">Gestiona tus jugadas y ejercicios tácticos</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-[#0d1117] border border-slate-800/50 text-slate-300 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-slate-800/30 transition-all">
               <i className="fas fa-sync-alt"></i> Regenerar Thumbnails
             </button>
             <button 
               onClick={handleCreate}
               className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
             >
               <i className="fas fa-plus"></i> Crear Jugada
             </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d1117] border border-slate-800/50 text-white placeholder-slate-500 pl-11 pr-4 py-3 rounded-lg text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <select className="bg-[#0d1117] border border-slate-800/50 text-white px-4 py-3 rounded-lg text-sm min-w-[220px] focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer">
          <option>Todas las categorías</option>
        </select>
      </div>

      {loading ? (
        <div className="py-32 flex justify-center">
          <div className="text-slate-400 text-sm flex items-center gap-3">
            <i className="fas fa-spinner fa-spin"></i>
            Cargando jugadas...
          </div>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-16 h-16 bg-[#0d1117] border border-slate-800/50 rounded-full flex items-center justify-center">
            <i className="fas fa-futbol text-slate-600 text-2xl"></i>
          </div>
          <div className="space-y-2">
            <p className="text-slate-400 text-base font-medium">
              {searchTerm ? 'No se encontraron jugadas con ese nombre' : 'No hay jugadas creadas aún'}
            </p>
            {!searchTerm && (
              <p className="text-slate-600 text-sm">
                Comienza creando tu primera jugada táctica
              </p>
            )}
          </div>
          {!searchTerm && (
            <button 
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 mt-2"
            >
              <i className="fas fa-plus"></i> Crear primera jugada
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredBoards.map((board) => {
            const data = board.data ? JSON.parse(board.data) : null;
            const thumbnail = data?.thumbnail || data?.steps?.[0];
            
            return (
              <div 
                key={board.id} 
                className="bg-[#0d1117] border border-slate-800/50 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all group cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div className="aspect-video bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center relative overflow-hidden">
                  {thumbnail ? (
                    <img src={thumbnail} alt={board.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-futbol text-emerald-400/20 text-5xl"></i>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(board);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        board.id && handleDelete(board.id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white truncate mb-1">{board.nombre}</h3>
                  <p className="text-xs text-slate-500">
                    {board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'Sin fecha'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TacticalBoardManagement;
