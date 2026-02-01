import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import RoleManagement from './RoleManagement';
import { apiService, User } from '../services/api';

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
      // Use the centralized apiService instead of hardcoded localhost URL
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      // No alert needed here if the UI shows the empty/error state gracefully, 
      // but we can keep a subtle notification if desired. 
      // For now, let's trust the empty state or console.
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
      await apiService.deleteUser(id);
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Configuración de Usuarios</h2>
            <p className="text-secondary mb-3 small">Gestiona los accesos y niveles de seguridad del sistema</p>

            {/* Custom Tabs */}
            <div className="d-flex p-1 rounded" style={{ backgroundColor: '#161b22', width: 'fit-content' }}>
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`btn border-0 py-1.5 px-4 rounded transition-all ${activeTab === 'usuarios' ? 'text-white' : 'text-secondary'}`}
                style={{
                  backgroundColor: activeTab === 'usuarios' ? '#1f6feb' : 'transparent',
                  fontSize: '13px',
                  fontWeight: activeTab === 'usuarios' ? '600' : '400'
                }}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`btn border-0 py-1.5 px-4 rounded transition-all ${activeTab === 'roles' ? 'text-white' : 'text-secondary'}`}
                style={{
                  backgroundColor: activeTab === 'roles' ? '#1f6feb' : 'transparent',
                  fontSize: '13px',
                  fontWeight: activeTab === 'roles' ? '600' : '400'
                }}
              >
                Roles y Permisos
              </button>
            </div>
          </div>
        </div>


        {activeTab === 'usuarios' ? (
          <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center py-3 px-4">
              <div>
                <h5 className="mb-0 fs-6 fw-bold text-white">Lista de Usuarios</h5>
                <small className="text-secondary">Administra los usuarios del sistema</small>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
                >
                  <i className="bi bi-file-pdf"></i> Exportar PDF
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary d-flex align-items-center gap-2 px-3"
                  style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
                >
                  <i className="bi bi-plus-lg"></i> Nuevo Usuario
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="px-4 py-2 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
                <small className="text-secondary">Mostrando {users.length} de {users.length} usuarios</small>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                  <thead style={{ backgroundColor: '#161b22' }}>
                    <tr>
                      <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Nro.</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Nombre</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Email</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Teléfono</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Último Login</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Roles</th>
                      <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-secondary">
                          <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          <p className="mb-0">Cargando usuarios...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div className="d-flex flex-column align-items-center">
                            <i className="bi bi-people text-secondary display-4 mb-3"></i>
                            <p className="text-muted fw-medium mb-0">No se encontraron usuarios</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={user.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                          <td className="ps-4 text-secondary border-bottom border-secondary border-opacity-10 py-3">{index + 1}</td>
                          <td className="border-bottom border-secondary border-opacity-10 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                              </div>
                              <span className="fw-bold text-white">{user.nombre} {user.apellido}</span>
                            </div>
                          </td>
                          <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{user.email}</td>
                          <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{user.telefono || '-'}</td>
                          <td className="text-secondary small border-bottom border-secondary border-opacity-10 py-3">
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleString('es-ES') : '-'}
                          </td>
                          <td className="border-bottom border-secondary border-opacity-10 py-3">
                            <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3" style={{ fontSize: '11px' }}>
                              {user.role}
                            </span>
                          </td>
                          <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="btn btn-sm text-primary p-0 me-2"
                                title="Editar"
                                style={{ backgroundColor: 'transparent', border: 'none' }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(user.id!)}
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
        ) : (
          <RoleManagement />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
