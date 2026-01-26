import React, { useState, useEffect } from 'react';

interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  academia?: string;
}

interface Permission {
  moduloId: number;
  moduloNombre: string;
  ver: boolean;
  crear: boolean;
  modificar: boolean;
  eliminar: boolean;
}

interface RoleFormProps {
  role?: Role | null;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'permisos'>('general');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([
    { moduloId: 1, moduloNombre: 'Dashboard', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 2, moduloNombre: 'Alumnos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 3, moduloNombre: 'Grupos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 4, moduloNombre: 'Categorías', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 5, moduloNombre: 'Entrenamientos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 6, moduloNombre: 'Juegos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 7, moduloNombre: 'Representantes', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 8, moduloNombre: 'Abonos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 9, moduloNombre: 'Becas', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 10, moduloNombre: 'Servicios', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 11, moduloNombre: 'Productos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 12, moduloNombre: 'Métodos de Pago', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 13, moduloNombre: 'Egresos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 14, moduloNombre: 'Ingresos', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 15, moduloNombre: 'Calendario', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 16, moduloNombre: 'Pizarra BOV', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 17, moduloNombre: 'Usuarios (manage_users)', ver: false, crear: false, modificar: false, eliminar: false },
    { moduloId: 18, moduloNombre: 'Roles (manage_roles)', ver: false, crear: false, modificar: false, eliminar: false },
  ]);

  const isEditMode = !!role;

  useEffect(() => {
    if (role) {
      setNombre(role.nombre);
      setDescripcion(role.descripcion);
      loadPermissions(role.id);
    }
  }, [role]);

  const loadPermissions = async (roleId: number) => {
    try {
      const response = await fetch(`http://localhost:5081/api/roles/${roleId}/permissions`);
      if (response.ok) {
        const savedPermissions = await response.json();
        
        // Crear un mapa de los permisos guardados
        const permissionsMap = new Map(
          savedPermissions.map((p: Permission) => [p.moduloId, p])
        );
        
        // Actualizar el estado de permisos manteniendo todos los módulos
        setPermissions(prev => prev.map(p => {
          const saved = permissionsMap.get(p.moduloId);
          return saved ? saved : p;
        }));
      }
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

    const roleData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      tipo: 'Sistema',
      permissions: permissions,
    };

    try {
      const url = isEditMode 
        ? `http://localhost:5081/api/roles/${role.id}`
        : 'http://localhost:5081/api/roles';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el rol');
      }

      alert(isEditMode ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
      onCancel();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el rol');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Crear Nuevo Rol</h3>
        <p className="text-xs text-slate-500">Define un nuevo rol y asigna los permisos correspondientes</p>
      </div>

      <div className="bg-[#1a2332] border border-slate-700 rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-[#111827] text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Información General
          </button>
          <button
            onClick={() => setActiveTab('permisos')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'permisos'
                ? 'bg-[#111827] text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            Permisos
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del rol"
                  className="w-full px-4 py-2 bg-[#1a2332] border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del rol"
                  rows={4}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Permisos por Módulo</h4>
              <p className="text-xs text-slate-400 mb-6">Configura los permisos de acceso para cada módulo del sistema</p>
              
              <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 bg-slate-900/30 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Módulo</th>
                      <th className="px-6 py-3 font-semibold text-center">Ver</th>
                      <th className="px-6 py-3 font-semibold text-center">Crear</th>
                      <th className="px-6 py-3 font-semibold text-center">Modificar</th>
                      <th className="px-6 py-3 font-semibold text-center">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.moduloId} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{perm.moduloNombre}</td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.ver}
                            onChange={() => handlePermissionChange(perm.moduloId, 'ver')}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.crear}
                            onChange={() => handlePermissionChange(perm.moduloId, 'crear')}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.modificar}
                            onChange={() => handlePermissionChange(perm.moduloId, 'modificar')}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.eliminar}
                            onChange={() => handlePermissionChange(perm.moduloId, 'eliminar')}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            {isEditMode ? 'Actualizar Rol' : 'Crear Rol'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;
