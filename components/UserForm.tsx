
import React, { useState, useEffect } from 'react';
import { apiService, User, Personal } from '../services/api';

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
  const [codigoPais, setCodigoPais] = useState('+51');
  const [role, setRole] = useState('');
  const [personalId, setPersonalId] = useState<number | undefined>(undefined);
  const [personalList, setPersonalList] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'Administrador', title: 'Administrador', description: 'Acceso completo al sistema' },
    { id: 'Entrenador', title: 'Entrenador', description: 'Gestión de entrenamientos y partidos' },
    { id: 'Representante', title: 'Representante', description: 'Acceso limitado para representantes' },
  ];

  useEffect(() => {
    const loadPersonal = async () => {
      try {
        const data = await apiService.getPersonal();
        setPersonalList(data);
      } catch (error) {
        console.error('Error loading personal:', error);
      }
    };
    loadPersonal();

    if (user) {
      setNombre(user.nombre || '');
      setApellido(user.apellido || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
      setRole(user.role || '');
      setPersonalId(user.personalId);
    }
  }, [user]);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    setPersonalId(selectedId);

    const selectedPersonal = personalList.find(p => p.id === selectedId);
    if (selectedPersonal) {
      setNombre(selectedPersonal.nombres);
      setApellido(selectedPersonal.apellidos);
      if (selectedPersonal.celular) setTelefono(selectedPersonal.celular);
      // Auto-assign role based on Cargo if not already set
      if (!role && selectedPersonal.cargo) {
        if (selectedPersonal.cargo === 'Entrenador') setRole('Entrenador');
        else if (selectedPersonal.cargo === 'Administrativo') setRole('Administrador');
      }
    }
  };

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
        active: true,
        personalId: personalId
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
                <div className="col-12 mb-3">
                  <label>Vincular con Personal (Opcional)</label>
                  <select
                    className="form-select"
                    value={personalId || ''}
                    onChange={handlePersonalChange}
                  >
                    <option value="">-- Seleccionar personal --</option>
                    {personalList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos} - {p.cargo || 'Sin Cargo'}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted d-block mt-1">
                    Seleccionar un personal autocompletará el nombre y apellido.
                  </small>
                </div>

                <div className="col-md-6">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan"
                    required
                    readOnly={!!personalId}
                    style={personalId ? { backgroundColor: '#21262d', opacity: 0.7 } : {}}
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
                    readOnly={!!personalId}
                    style={personalId ? { backgroundColor: '#21262d', opacity: 0.7 } : {}}
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
                <div className="col-md-2">
                  <label>Cód.</label>
                  <select
                    className="form-select"
                    value={codigoPais}
                    onChange={(e) => setCodigoPais(e.target.value)}
                  >
                    <option value="+51">+51 (PE)</option>
                    <option value="+58">+58 (VE)</option>
                    <option value="+57">+57 (CO)</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="999 999 999"
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
