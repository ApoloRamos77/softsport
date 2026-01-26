
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Mi Perfil</h1>
        <p className="text-sm text-slate-400">Gestiona tu información personal</p>
      </div>

      {/* Personal Information */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Información Personal</h3>
          <p className="text-sm text-slate-400 mb-6">Actualiza tus datos personales</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-3">
            <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {getInitials()}
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 border-2 border-slate-800 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
               <i className="fas fa-arrow-down text-xs"></i>
            </button>
          </div>
          <h3 className="text-lg font-bold text-white">{formData.nombre} {formData.apellido}</h3>
          <p className="text-sm text-slate-400 mt-1">{formData.email}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Nombre</label>
              <input 
                type="text" 
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Apellido</label>
              <input 
                type="text" 
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Email</label>
            <input 
              type="email" 
              value={formData.email}
              readOnly
              className="w-full p-3 rounded-lg bg-slate-900/30 border border-slate-700/50 text-slate-500 cursor-not-allowed text-sm"
            />
            <p className="text-xs text-slate-500">El email no puede ser modificado</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-white">Teléfono</label>
            <div className="flex gap-3">
              <select className="w-32 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm">
                <option>VE +58</option>
                <option>PE +51</option>
                <option>CO +57</option>
                <option>AR +54</option>
              </select>
              <input 
                type="text" 
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="Número"
                className="flex-1 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Apariencia</h3>
          <p className="text-sm text-slate-400 mb-6">Personaliza la apariencia de la aplicación</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-700 text-slate-400'}`}>
              <i className="fas fa-moon text-lg"></i>
            </div>
            <div>
               <p className="text-base font-semibold text-white">Modo Oscuro</p>
               <p className="text-sm text-slate-400">Cambia el tema de la aplicación</p>
            </div>
          </div>
          <button 
            onClick={onToggleTheme}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${darkMode ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
