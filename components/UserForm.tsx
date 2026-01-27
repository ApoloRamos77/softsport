
import React, { useState, useEffect } from 'react';
import { apiService, User } from '../services/api';

interface UserFormProps {
  user?: User | null;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onCancel }) => {
  const isEditMode = !!user;
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'Administrador', title: 'Administrador', description: 'Acceso completo al sistema' },
    { id: 'Entrenador', title: 'Entrenador', description: 'Gestión de entrenamientos y partidos' },
    { id: 'Representante', title: 'Representante', description: 'Acceso limitado para representantes' },
  ];

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setApellido(user.apellido || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
      setRole(user.role || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim() || !role) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!isEditMode && !password) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      setLoading(true);
      const userData: any = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono || null,
        role: role,
        active: true
      };

      if (password) {
        userData.passwordHash = password;
      }

      if (isEditMode && user?.id) {
        await apiService.updateUser(user.id, userData);
        alert('Usuario actualizado exitosamente');
      } else {
        await apiService.createUser(userData);
        alert('Usuario creado exitosamente');
      }

      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el usuario`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fadeIn d-flex justify-content-center py-4">
      <div className="card shadow-xl border-secondary border-opacity-25 w-100" style={{ maxWidth: '800px', backgroundColor: '#161b22' }}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4 px-4">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 d-block">Control de Acceso</label>
          <h5 className="mb-0 fw-bold text-white tracking-tight">{isEditMode ? 'Editar Perfil de Usuario' : 'Crear Nuevo Usuario'}</h5>
          <p className="text-secondary small mb-0">Gestione las credenciales y roles de acceso al sistema.</p>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Información de Identidad</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej: Pérez"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+58 412..."
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Seguridad y Permisos</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Rol en el Sistema *</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="" disabled>Seleccionar rol...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                  {role && (
                    <div className="form-text text-secondary mt-2" style={{ fontSize: '11px' }}>
                      <i className="bi bi-info-circle me-1"></i>
                      {roles.find(r => r.title === role)?.description}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label>
                    Contraseña {isEditMode && <span className="fw-normal text-secondary">(Blanco para mantener)</span>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!isEditMode}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary border-opacity-25">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
                style={{ fontSize: '13px', fontWeight: '600' }}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary px-5 fw-bold"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontSize: '13px' }}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                ) : (
                  isEditMode ? 'Actualizar Usuario' : 'Registrar Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
