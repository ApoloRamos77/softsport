
import React, { useState, useEffect } from 'react';
import RoleForm from './RoleForm';

interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  academia?: string;
}

const RoleManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5081/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error cargando roles:', error);
      alert('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5081/api/roles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el rol');
      }

      alert('Rol eliminado exitosamente');
      loadRoles();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el rol');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRole(null);
    loadRoles();
  };

  if (showForm) {
    return <RoleForm role={editingRole} onCancel={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Roles del Sistema</h3>
          <p className="text-xs text-slate-500">Gestiona los roles y permisos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nuevo Rol
        </button>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 bg-slate-900/30 border-b border-slate-800">
            <tr>
              <th className="px-6 py-3 font-semibold">Nombre</th>
              <th className="px-6 py-3 font-semibold">Descripción</th>
              <th className="px-6 py-3 font-semibold text-center">Tipo</th>
              <th className="px-6 py-3 font-semibold text-center">Academia</th>
              <th className="px-6 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                  No se encontraron roles
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{role.nombre}</td>
                  <td className="px-6 py-4 text-slate-300">{role.descripcion}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      role.tipo === 'Personalizado' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {role.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-center">{role.academia || 'Todas'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded transition-colors"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded transition-colors"
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
  );
};

export default RoleManagement;
