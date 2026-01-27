
import React, { useState, useEffect } from 'react';
import { apiService, Role, Permission } from '../services/api';

interface RoleFormProps {
  role?: Role | null;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'permisos'>('general');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([
    { moduloId: 1, moduloNombre: 'Dashboard', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 2, moduloNombre: 'Atletas', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 3, moduloNombre: 'Grupos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 4, moduloNombre: 'Categorías', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 5, moduloNombre: 'Entrenamientos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 6, moduloNombre: 'Juegos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 7, moduloNombre: 'Representantes', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 8, moduloNombre: 'Abonos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 9, moduloNombre: 'Becas', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 10, moduloNombre: 'Servicios', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 11, moduloNombre: 'Productos', ver: false, crear: false, modificar: false, eliminar: false },
  ]);

  const isEditMode = !!role;

  useEffect(() => {
    if (role) {
      setNombre(role.nombre);
      setDescripcion(role.descripcion);
      if (role.id) {
        loadPermissions(role.id);
      }
    }
  }, [role]);

  const loadPermissions = async (roleId: number) => {
    try {
      const savedPermissions = await apiService.getRolePermissions(roleId);
      const permissionsMap = new Map(
        savedPermissions.map((p: Permission) => [p.moduloId, p])
      );
      setPermissions(prev => prev.map(p => {
        const saved = permissionsMap.get(p.moduloId);
        return saved ? saved : p;
      }));
    } catch (error) {
      console.error('Error cargando permisos:', error);
    }
  };

  const handlePermissionChange = (moduloId: number, permission: 'ver' | 'crear' | 'modificar' | 'eliminar') => {
    setPermissions(prev => prev.map(p =>
      p.moduloId === moduloId
        ? { ...p, [permission]: !p[permission] }
        : p
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre del rol es requerido');
      return;
    }

    if (!descripcion.trim()) {
      alert('La descripción del rol es requerida');
      return;
    }

    setLoading(true);
    const roleData: Role = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      tipo: 'Sistema',
      permissions: permissions,
    };

    try {
      if (isEditMode && role?.id) {
        await apiService.updateRole(role.id, roleData);
        alert('Rol actualizado exitosamente');
      } else {
        await apiService.createRole(roleData);
        alert('Rol creado exitosamente');
      }
      onCancel();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg mx-auto border-0" style={{ maxWidth: '900px', backgroundColor: '#0f1419' }}>
      <div className="card-header bg-transparent border-0 pt-4 pb-2 px-4">
        <h4 className="mb-1 fw-bold text-white">{isEditMode ? 'Editar Rol' : 'Crear Nuevo Rol'}</h4>
        <small className="text-secondary">Modifica la información del rol y sus permisos por módulo</small>

        {/* Custom Tabs */}
        <div className="d-flex mt-4 p-1 rounded" style={{ backgroundColor: '#161b22' }}>
          <button
            className={`flex-fill btn border-0 fw-medium py-2 rounded ${activeTab === 'general' ? 'text-white' : 'text-secondary'}`}
            style={{ backgroundColor: activeTab === 'general' ? '#1f6feb' : 'transparent', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('general')}
          >
            Información General
          </button>
          <button
            className={`flex-fill btn border-0 fw-medium py-2 rounded ${activeTab === 'permisos' ? 'text-white' : 'text-secondary'}`}
            style={{ backgroundColor: activeTab === 'permisos' ? '#1f6feb' : 'transparent', transition: 'all 0.2s' }}
            onClick={() => setActiveTab('permisos')}
          >
            Permisos por Módulo
          </button>
        </div>
      </div>

      <div className="card-body px-4 pb-4">
        <form onSubmit={handleSubmit}>
          {activeTab === 'general' ? (
            <div className="d-flex flex-column gap-4 mt-2">
              <div>
                <label className="form-label text-white fw-bold mb-2">Nombre del Rol</label>
                <input
                  type="text"
                  className="form-control text-white border-secondary border-opacity-25"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Administrador"
                  style={{ backgroundColor: '#0d1117', padding: '10px', fontSize: '14px' }}
                  required
                />
              </div>

              <div>
                <label className="form-label text-white fw-bold mb-2">Descripción</label>
                <textarea
                  className="form-control text-white border-secondary border-opacity-25"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada del rol..."
                  rows={4}
                  style={{ backgroundColor: '#0d1117', padding: '10px', resize: 'none', fontSize: '14px' }}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div className="mb-4">
                <h5 className="fw-bold text-white mb-1">Permisos por Módulo</h5>
                <small className="text-secondary">Configura los permisos de acceso para cada módulo del sistema</small>
              </div>

              <div className="table-responsive rounded border border-secondary border-opacity-25">
                <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                  <thead style={{ backgroundColor: '#161b22' }}>
                    <tr>
                      <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">Módulo</th>
                      <th className="text-center py-3 text-white border-bottom border-secondary border-opacity-25">Ver</th>
                      <th className="text-center py-3 text-white border-bottom border-secondary border-opacity-25">Crear</th>
                      <th className="text-center py-3 text-white border-bottom border-secondary border-opacity-25">Modificar</th>
                      <th className="text-center py-3 text-white border-bottom border-secondary border-opacity-25">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.moduloId} style={{ backgroundColor: '#0d1117' }}>
                        <td className="ps-4 py-3 fw-medium text-white border-bottom border-secondary border-opacity-10">{perm.moduloNombre}</td>
                        {['ver', 'crear', 'modificar', 'eliminar'].map((action) => (
                          <td key={action} className="text-center border-bottom border-secondary border-opacity-10">
                            <div className="form-check d-flex justify-content-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={(perm as any)[action]}
                                onChange={() => handlePermissionChange(perm.moduloId, action as any)}
                                style={{
                                  backgroundColor: (perm as any)[action] ? '#1f6feb' : 'transparent',
                                  borderColor: '#30363d',
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer'
                                }}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mt-5">
            {/* Using transparent cancel button to match dark theme better or styled outline */}
            <button
              type="button"
              onClick={onCancel}
              className="btn text-white fw-medium px-4"
              style={{ backgroundColor: 'transparent' }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn text-white fw-medium px-4"
              style={{ backgroundColor: '#1f6feb' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
