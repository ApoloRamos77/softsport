
import React, { useState, useEffect } from 'react';
import { apiService, User } from '../services/api';

interface ProfileSettingsProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ darkMode, onToggleTheme }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Using user ID 1 as default - in production this would come from authentication
      const userData = await apiService.getUserProfile(1);
      setUser(userData);
      setFormData({
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        telefono: userData.telefono || ''
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiService.updateUserProfile(1, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono
      });
      alert('Perfil actualizado exitosamente');
      await loadUserProfile();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    if (!formData.nombre && !formData.apellido) return 'AR';
    return `${formData.nombre.charAt(0)}${formData.apellido.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="mb-4">
        <h2 className="text-white fw-bold h4 mb-1">Mi Perfil</h2>
        <p className="text-secondary mb-0 small">Gestiona tu información personal y preferencias de visualización</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          {/* Personal Information */}
          <div className="card border-0 shadow-lg mb-4" style={{ backgroundColor: '#161b22' }}>
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
              <h5 className="mb-0 text-white fw-bold fs-6">Información Personal</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column align-items-center mb-5">
                <div className="position-relative mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-lg overflow-hidden"
                    style={{ width: '100px', height: '100px', backgroundColor: '#1f6feb', fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {getInitials()}
                  </div>
                  <button className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-0 shadow"
                    style={{ width: '32px', height: '32px', border: '2px solid #161b22', backgroundColor: '#1f6feb' }}>
                    <i className="bi bi-camera-fill small"></i>
                  </button>
                </div>
                <h5 className="text-white fw-bold mb-1">{formData.nombre} {formData.apellido}</h5>
                <p className="text-secondary small mb-0">{formData.email}</p>
              </div>

              <form className="row g-3" onSubmit={handleSave}>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold mb-1">Email (No editable)</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-muted"
                    style={{ backgroundColor: '#0d1117', cursor: 'not-allowed' }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold mb-1">Teléfono</label>
                  <div className="input-group">
                    <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary small">PE +51</span>
                    <input
                      type="text"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="Número de contacto"
                      className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                    />
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-end pt-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary px-5 fw-bold"
                    style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                  >
                    {saving ? 'Guardando...' : 'Guardar Perfil'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          {/* Appearance Section */}
          <div className="card border-0 shadow-lg" style={{ backgroundColor: '#161b22' }}>
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
              <h5 className="mb-0 text-white fw-bold fs-6">Apariencia y Tema</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between p-3 rounded-3 border border-secondary border-opacity-10" style={{ backgroundColor: '#0d1117' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', backgroundColor: '#1c212a' }}>
                    <i className={`bi ${darkMode ? 'bi-moon-stars-fill text-warning' : 'bi-sun-fill text-warning'} fs-5`}></i>
                  </div>
                  <div>
                    <p className="text-white fw-bold mb-0 small">Modo Oscuro</p>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.75rem' }}>Cambiar tema visual</p>
                  </div>
                </div>
                <div className="form-check form-switch pe-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={darkMode}
                    onChange={onToggleTheme}
                    style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
