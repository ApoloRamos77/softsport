
import React, { useState, useEffect } from 'react';
import GroupForm from './GroupForm';

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
      const response = await fetch('http://localhost:5081/api/grupos');
      const data = await response.json();
      setGrupos(data);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (grupoData: any) => {
    try {
      const url = editingGrupo 
        ? `http://localhost:5081/api/grupos/${editingGrupo.id}` 
        : 'http://localhost:5081/api/grupos';
      const method = editingGrupo ? 'PUT' : 'POST';

      const dataToSend = editingGrupo 
        ? { ...grupoData, id: editingGrupo.id }
        : grupoData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al guardar el grupo');
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
      const response = await fetch(`http://localhost:5081/api/grupos/${grupoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el grupo');
      }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Grupos</h2>
          <p className="text-sm text-slate-400">Administra los grupos y categorías de tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <i className="fas fa-plus"></i> Nuevo Grupo
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">
          Cargando...
        </div>
      ) : grupos.length === 0 ? (
        <div className="py-10 text-slate-400 italic">
          No hay grupos creados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <div 
              key={grupo.id} 
              className="bg-[#111827] border border-slate-800 rounded-lg p-5 hover:border-blue-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{grupo.nombre}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(grupo)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(grupo.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
              {grupo.descripcion && (
                <p className="text-sm text-slate-400">{grupo.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
