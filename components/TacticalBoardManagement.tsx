
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Tablero Táctico</h2>
            <p className="text-secondary mb-0 small">Gestiona tus jugadas y ejercicios tácticos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
            >
              <i className="bi bi-arrow-clockwise"></i> Regenerar Thumbnails
            </button>
            <button
              onClick={handleCreate}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Crear Jugada
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3">
            <div className="d-flex gap-3 flex-wrap">
              <div className="flex-grow-1 position-relative">
                <i className="bi bi-search position-absolute text-secondary" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control border-secondary border-opacity-25 text-white placeholder-secondary ps-5"
                  style={{ backgroundColor: '#0d1117' }}
                />
              </div>
              <select className="form-select border-secondary border-opacity-25 text-white" style={{ backgroundColor: '#0d1117', maxWidth: '250px' }}>
                <option>Todas las categorías</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="text-secondary align-self-center">Cargando jugadas...</span>
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="text-center py-5 card border-0" style={{ backgroundColor: '#161b22' }}>
            <div className="card-body">
              <div className="d-flex flex-column align-items-center">
                <i className="bi bi-heptagon text-secondary display-4 mb-3"></i>
                <p className="text-secondary fw-medium mb-1">
                  {searchTerm ? 'No se encontraron jugadas con ese nombre' : 'No hay jugadas creadas aún'}
                </p>
                {!searchTerm && (
                  <>
                    <p className="text-muted small mb-3">Comienza creando tu primera jugada táctica</p>
                    <button
                      onClick={handleCreate}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#1f6feb' }}
                    >
                      Crear primera jugada
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBoards.map((board) => {
              const data = board.data ? JSON.parse(board.data) : null;
              const thumbnail = data?.thumbnail || data?.steps?.[0];

              return (
                <div key={board.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                  <div
                    className="card h-100 border-secondary border-opacity-25 overflow-hidden shadow-sm hover-shadow transition-all"
                    style={{ backgroundColor: '#0d1117', cursor: 'pointer' }}
                    onClick={() => handleEdit(board)}
                  >
                    <div className="ratio ratio-16x9 position-relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
                      {thumbnail ? (
                        <img src={thumbnail} alt={board.nombre} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-success bg-gradient">
                          <i className="bi bi-card-image text-white display-4 opacity-50"></i>
                        </div>
                      )}

                      {/* Hover Actions Overlay */}
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center gap-2 opacity-0 hover-opacity-100 transition-opacity" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        {/* Note: The hover effect needs CSS support or we rely on always visible buttons if hover fails. 
                           For reliability, we can make this 'group-hover' equivalent via CSS or just have buttons visible on card footer.
                           Let's put actions in the footer for better mobile support too.
                       */}
                      </div>
                    </div>

                    <div className="card-body p-3 d-flex justify-content-between align-items-start">
                      <div className="overflow-hidden me-2">
                        <h5 className="card-title text-white h6 mb-1 text-truncate">{board.nombre}</h5>
                        <p className="card-text text-secondary small mb-0">
                          {board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          }) : 'Sin fecha'}
                        </p>
                      </div>
                      <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-link text-secondary p-0" type="button" data-bs-toggle="dropdown">
                          <i className="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-dark">
                          <li><button className="dropdown-item" onClick={() => handleEdit(board)}><i className="bi bi-pencil me-2"></i>Editar</button></li>
                          <li><button className="dropdown-item text-danger" onClick={() => board.id && handleDelete(board.id)}><i className="bi bi-trash me-2"></i>Eliminar</button></li>
                        </ul>
                      </div>
                    </div>

                    <div className="card-footer p-2 bg-transparent border-top border-secondary border-opacity-10 d-flex justify-content-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(board);
                        }}
                        className="btn btn-sm btn-outline-primary border-0"
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          board.id && handleDelete(board.id);
                        }}
                        className="btn btn-sm btn-outline-danger border-0"
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalBoardManagement;
