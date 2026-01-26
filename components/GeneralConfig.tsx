
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
    <div className="space-y-6 animate-fadeIn">
      {/* Security Card */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-1">
          <i className="fas fa-shield-alt text-blue-500 text-lg"></i>
          <h3 className="text-xl font-bold text-white">Seguridad</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">Gestiona la seguridad de tu cuenta</p>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
             <i className="fas fa-lock text-xs"></i> Cambiar Contraseña
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Contraseña Actual</label>
              <input 
                type="password" 
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Nueva Contraseña</label>
              <input 
                type="password" 
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="Ingresa tu nueva contraseña"
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirma tu nueva contraseña"
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50">
                {saving ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preferences Placeholder */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <h4 className="text-xl font-bold text-white mb-1">Preferencias</h4>
        <p className="text-sm text-slate-400 mb-6">Configuración de preferencias (próximamente)</p>
        <p className="text-sm text-slate-500">Esta sección estará disponible próximamente con más opciones de configuración.</p>
      </div>
    </div>
  );
};

export default GeneralConfig;
