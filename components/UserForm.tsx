
import React, { useState, useEffect } from 'react';

interface UserFormProps {
  user?: any;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onCancel }) => {
  const isEditMode = !!user;
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigoPais, setCodigoPais] = useState('+58');
  const [rol, setRol] = useState('');
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const roles = [
    { id: 'Administrador', title: 'Administrador', description: 'Rol administrador con acceso completo a todas las funcionalidades' },
    { id: 'Entrenador', title: 'Entrenador', description: 'Rol de entrenador con acceso a gestión de entrenamientos y juegos' },
    { id: 'Representante', title: 'Representante', description: 'Rol para padres y representantes de atletas' },
  ];

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setApellido(user.apellido || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
      setRol(user.role || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !rol) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isEditMode && !password) {
      alert('La contraseña es requerida');
      return;
    }

    try {
      const userData: any = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono ? `${codigoPais}${telefono}` : null,
        role: rol
      };

      if (password) {
        userData.passwordHash = password; // En producción, esto debería ser hasheado
      }

      const url = isEditMode 
        ? `http://localhost:5081/api/users/${user.id}`
        : 'http://localhost:5081/api/users';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
      }

      alert(`Usuario ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0d1117] rounded-lg shadow-2xl border border-slate-800 overflow-hidden">
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <p className="text-xs text-slate-500 mt-1">Ingresa los datos del {isEditMode ? '' : 'nuevo '}usuario y asigna roles</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-white">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-md w-full text-sm focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-white">Apellido</label>
            <input 
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-md w-full text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-white">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-md w-full text-sm focus:outline-none focus:border-blue-500/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-white">Contraseña {isEditMode && '(dejar en blanco para no cambiar)'}</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-md w-full text-sm focus:outline-none focus:border-blue-500/50"
              required={!isEditMode}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-white">Teléfono</label>
            <div className="flex gap-2">
              <select 
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
                className="bg-[#1a2332] border border-slate-700 text-white p-2.5 rounded-md text-sm w-1/3 focus:outline-none focus:border-blue-500/50"
              >
                <option value="+58">+58 Venezuela</option>
                <option value="+51">+51 Perú</option>
                <option value="+57">+57 Colombia</option>
              </select>
              <input 
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="4241234567"
                className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2.5 rounded-md text-sm flex-1 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <p className="text-[10px] text-slate-500">Formato: +58 + 10 dígitos (ej: 4241234567)</p>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[13px] font-bold text-white">Rol</label>
            <div 
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className="bg-[#1a2332] border border-slate-700 text-white p-2.5 rounded-md w-full text-sm flex items-center justify-between cursor-pointer focus-within:border-blue-500/50"
            >
              <span>{rol || 'Seleccionar rol'}</span>
              <i className={`fas fa-chevron-down text-xs transition-transform ${isRoleOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {isRoleOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#161d2b] border border-slate-800 rounded-md shadow-2xl overflow-hidden py-1">
                {roles.map((r, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setRol(r.title);
                      setIsRoleOpen(false);
                    }}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-white">{r.title}</span>
                      <span className="text-[12px] text-slate-500 font-normal">- {r.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-bold text-sm shadow-lg shadow-blue-500/20"
            >
              {isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
