import React, { useState, useEffect } from 'react';
import GroupForm from './GroupForm';
import { apiService } from '../services/api';

interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
}

const GroupManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Grupo>('grupos');
      setGrupos(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (grupoData: any) => {
    try {
      if (editingGrupo) {
        await apiService.update('grupos', editingGrupo.id, {
          ...grupoData,
          id: editingGrupo.id
        });
      } else {
        await apiService.create('grupos', grupoData);
      }

      await loadGrupos();
      setShowForm(false);
      setEditingGrupo(null);
    } catch (error: any) {
      alert(error.message || 'Error al guardar el grupo');
      console.error('Error:', error);
    }
  };

  const handleEdit = (grupo: Grupo) => {
    setEditingGrupo(grupo);
    setShowForm(true);
  };

  const handleDelete = async (grupoId: number) => {
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;

    try {
      await apiService.delete('grupos', grupoId);
      await loadGrupos();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el grupo');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGrupo(null);
  };

  if (showForm) {
    return (
      <GroupForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialData={editingGrupo}
        isEditing={!!editingGrupo}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="d-flex justify-content-between align-items-end mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Grupos</h2>
            <p className="text-secondary mb-0 small">Administra los grupos y horarios de entrenamiento</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Grupo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-secondary">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mb-0">Cargando grupos...</p>
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center py-5">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-collection text-secondary display-4 mb-3"></i>
              <p className="text-muted fw-medium mb-0">No hay grupos creados</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {grupos.map((grupo) => (
              <div key={grupo.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22', transition: 'transform 0.2s' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold mb-0 text-white">{grupo.nombre}</h5>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleEdit(grupo)}
                          className="btn btn-sm text-primary p-1"
                          title="Editar"
                          style={{ background: 'transparent', border: 'none' }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(grupo.id)}
                          className="btn btn-sm text-danger p-1"
                          title="Eliminar"
                          style={{ background: 'transparent', border: 'none' }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    {grupo.descripcion && (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="badge border border-secondary border-opacity-30 text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <i className="bi bi-clock me-1"></i>
                          {grupo.descripcion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;
