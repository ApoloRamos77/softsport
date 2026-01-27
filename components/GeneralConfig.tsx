
import React, { useState } from 'react';
import { apiService } from '../services/api';

const GeneralConfig: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);
      await apiService.changePassword(1, formData.currentPassword, formData.newPassword);
      alert('Contraseña cambiada exitosamente');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="mb-4">
        <h2 className="text-white fw-bold h4 mb-1">Configuración General</h2>
        <p className="text-secondary mb-0 small">Gestiona la seguridad y preferencias de tu cuenta</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          {/* Security Card */}
          <div className="card border-0 shadow-lg" style={{ backgroundColor: '#161b22' }}>
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock text-primary fs-5"></i>
                <h5 className="mb-0 text-white fw-bold fs-6">Seguridad de la Cuenta</h5>
              </div>
            </div>
            <div className="card-body p-4">
              <p className="text-secondary small mb-4">Se recomienda usar una contraseña fuerte que no utilices en otros sitios.</p>

              <form className="d-flex flex-column gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="form-label text-secondary small fw-bold mb-1">Contraseña Actual</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Contraseña actual"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div>
                  <label className="form-label text-secondary small fw-bold mb-1">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Nueva contraseña"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div>
                  <label className="form-label text-secondary small fw-bold mb-1">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirmar nueva contraseña"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>

                <div className="d-flex justify-content-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary px-4 fw-bold"
                    style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Guardando...
                      </>
                    ) : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          {/* Preferences Card */}
          <div className="card border-0 shadow-lg" style={{ backgroundColor: '#161b22' }}>
            <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-3 px-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-gear text-secondary fs-5"></i>
                <h5 className="mb-0 text-white fw-bold fs-6">Preferencias</h5>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="text-center py-4">
                <div className="rounded-circle bg-dark bg-opacity-25 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-clock-history text-secondary fs-3"></i>
                </div>
                <h6 className="text-white fw-bold mb-2">Próximamente</h6>
                <p className="text-secondary small mb-0 px-3">
                  Pronto podrás personalizar el idioma, zona horaria y notificaciones de la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralConfig;
