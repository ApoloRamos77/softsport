
import React, { useState, useEffect } from 'react';
import RoleForm from './RoleForm';
import { apiService, Role } from '../services/api';

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
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error cargando roles:', error);
      // alert('Error al cargar roles');
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
      await apiService.deleteRole(id);
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Roles del Sistema</h2>
            <p className="text-secondary mb-0 small">Gestiona los roles y sus permisos específicos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Rol
            </button>
          </div>
        </div>

        <div className="card shadow-sm border-0" style={{ backgroundColor: '#0f1419' }}>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Nombre</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Descripción</th>
                    <th className="text-center text-white border-bottom border-secondary border-opacity-25 py-3">Tipo</th>
                    <th className="text-center text-white border-bottom border-secondary border-opacity-25 py-3">Academia</th>
                    <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mb-0">Cargando roles...</p>
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-shield-lock text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-0">No se encontraron roles</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 fw-medium text-white border-bottom border-secondary border-opacity-10 py-3">{role.nombre}</td>
                        <td className="text-secondary small border-bottom border-secondary border-opacity-10 py-3">{role.descripcion}</td>
                        <td className="text-center border-bottom border-secondary border-opacity-10 py-3">
                          <span className={`badge bg-opacity-20 border border-opacity-30 text-white ${role.tipo === 'Personalizado'
                            ? 'bg-info border-info'
                            : 'bg-primary border-primary'
                            }`}>
                            {role.tipo}
                          </span>
                        </td>
                        <td className="text-center text-secondary small border-bottom border-secondary border-opacity-10 py-3">{role.academia || 'Todas'}</td>
                        <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              onClick={() => handleEdit(role)}
                              className="btn btn-sm text-primary border-0 p-0 me-2"
                              title="Editar"
                              style={{ backgroundColor: 'transparent' }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(role.id!)}
                              className="btn btn-sm text-danger border-0 p-0"
                              title="Eliminar"
                              style={{ backgroundColor: 'transparent' }}
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
    </div>
  );
};

export default RoleManagement;
