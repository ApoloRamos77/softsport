
import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import RoleManagement from './RoleManagement';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const UserManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (activeTab === 'usuarios') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5081/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5081/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      alert('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    loadUsers();
  };

  if (showForm) {
    return <UserForm user={editingUser} onCancel={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-md p-1 flex items-center">
        <button 
          onClick={() => setActiveTab('usuarios')}
          className={`px-6 py-1.5 text-xs font-semibold rounded transition-all ${activeTab === 'usuarios' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-1.5 text-xs font-semibold rounded transition-all ${activeTab === 'roles' ? 'bg-[#1e293b] text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Gestión de Roles
        </button>
      </div>

      {activeTab === 'usuarios' ? (
        <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Lista de Usuarios</h3>
              <p className="text-xs text-slate-500">Administra los usuarios del sistema</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              <i className="fas fa-plus"></i> Nuevo Usuario
            </button>
          </div>

          <div className="px-6 pb-2 text-[10px] text-slate-500 font-medium">
            Mostrando {users.length} de {users.length} usuarios
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-t border-slate-800">
              <thead className="text-slate-500 uppercase">
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 font-semibold">Nro.</th>
                  <th className="px-6 py-4 font-semibold">Nombre <i className="fas fa-arrow-up ml-1"></i></th>
                  <th className="px-6 py-4 font-semibold text-center md:text-left">Email</th>
                  <th className="px-6 py-4 font-semibold">Teléfono</th>
                  <th className="px-6 py-4 font-semibold">Último Login</th>
                  <th className="px-6 py-4 font-semibold">Roles</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      Cargando...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 text-slate-400">{index + 1}</td>
                      <td className="px-6 py-4 text-white font-bold">{user.nombre} {user.apellido}</td>
                      <td className="px-6 py-4 text-slate-300">{user.email}</td>
                      <td className="px-6 py-4 text-slate-400">{user.telefono || '-'}</td>
                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleString('es-ES') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold uppercase">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 font-semibold">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="text-white hover:text-blue-400"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="text-white hover:text-red-400"
                          >
                            Eliminar
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
      ) : (
        <RoleManagement />
      )}
    </div>
  );
};

export default UserManagement;
