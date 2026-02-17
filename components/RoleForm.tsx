
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
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const isEditMode = !!role;

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Fetch all available modules
      const modules = await apiService.getModules();

      // 2. Create base permissions from modules
      let initialPermissions: Permission[] = modules.map(m => ({
        moduloId: m.id,
        moduloNombre: m.nombre,
        ver: false,
        crear: false,
        modificar: false,
        eliminar: false
      }));

      // 3. If editing, fetch and merge saved permissions
      if (role && role.id) {
        setNombre(role.nombre);
        setDescripcion(role.descripcion);

        const savedPermissions = await apiService.getRolePermissions(role.id);
        const savedMap = new Map(savedPermissions.map(p => [p.moduloId, p]));

        initialPermissions = initialPermissions.map(p => {
          const saved = savedMap.get(p.moduloId);
          if (saved) {
            // Keep the name from the module source of truth, but take values from saved
            return { ...saved, moduloNombre: p.moduloNombre };
          }
          return p;
        });
      }

      setPermissions(initialPermissions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold text-white mb-1">Permisos por Módulo</h5>
                  <small className="text-secondary">Configura los permisos de acceso para cada módulo del sistema</small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setPermissions(prev => prev.map(p => ({ ...p, ver: true, crear: true, modificar: true, eliminar: true })))}
                  >
                    <i className="bi bi-check-all me-1"></i> Seleccionar Todo
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setPermissions(prev => prev.map(p => ({ ...p, ver: false, crear: false, modificar: false, eliminar: false })))}
                  >
                    <i className="bi bi-x-circle me-1"></i> Deseleccionar Todo
                  </button>
                </div>
              </div>

              {permissions.length === 0 ? (
                <div className="alert alert-warning border-0 bg-opacity-10 bg-warning text-warning d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                  <div>
                    <h6 className="fw-bold mb-1">No se encontraron módulos</h6>
                    <p className="mb-0 small">No hay módulos disponibles en la base de datos. Por favor, contacte al administrador del sistema para ejecutar el script de inicialización.</p>
                  </div>
                </div>
              ) : (
                <div className="table-responsive rounded border border-secondary border-opacity-25">
                  <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                    <thead style={{ backgroundColor: '#161b22' }}>
                      <tr>
                        <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">Módulo</th>
                        <th className="text-center py-3 text-white border-bottom border-secondary border-opacity-25">Acciones Rápidas</th>
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
                          <td className="text-center border-bottom border-secondary border-opacity-10">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-secondary border-opacity-25"
                                onClick={() => setPermissions(prev => prev.map(p => p.moduloId === perm.moduloId ? { ...p, ver: true, crear: true, modificar: true, eliminar: true } : p))}
                                title="Seleccionar todo"
                              >
                                <i className="bi bi-check-all"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary border-opacity-25"
                                onClick={() => setPermissions(prev => prev.map(p => p.moduloId === perm.moduloId ? { ...p, ver: false, crear: false, modificar: false, eliminar: false } : p))}
                                title="Deseleccionar todo"
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          </td>
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
              )}
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
