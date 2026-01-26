
import React, { useState, useEffect } from 'react';
import { apiService, AcademyConfig as AcademyConfigType } from '../services/api';

const AcademyConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'avanzado'>('general');
  const [config, setConfig] = useState<AcademyConfigType>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    colorMenu: '#1a73e8',
    colorBotones: '#0B66FF',
    whatsAppActivado: false,
    partidasActivado: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAcademyConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiService.updateAcademyConfig(config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AcademyConfigType, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
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
      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1.5 rounded-lg w-fit gap-1">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-8 py-2.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'general' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          General
        </button>
        <button 
          onClick={() => setActiveTab('branding')}
          className={`px-8 py-2.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'branding' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Branding
        </button>
        <button 
          onClick={() => setActiveTab('avanzado')}
          className={`px-8 py-2.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'avanzado' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Avanzado
        </button>
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 shadow-xl">
        {activeTab === 'general' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Nombre de la Academia</label>
                <input 
                  type="text" 
                  value={config.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email</label>
                <input 
                  type="email" 
                  value={config.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@academia.com"
                  className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Teléfono</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={config.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+51977816213"
                  className="w-40 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Número"
                  className="flex-1 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-500 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Dirección</label>
              <input 
                type="text" 
                value={config.direccion || ''}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Puente Piedra, Lima, Peru"
                className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="flex justify-end pt-6">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        ) : activeTab === 'branding' ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Logo Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                   <i className="fas fa-building text-4xl"></i>
                </div>
                <div className="flex-1 space-y-3">
                   <p className="text-sm font-semibold text-white">Subir nuevo logo</p>
                   <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
                      <label className="bg-slate-800 hover:bg-slate-700 cursor-pointer text-sm font-semibold py-2 px-4 rounded-lg border border-slate-600 transition-colors text-white">
                        Seleccionar archivo
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                      <span className="text-sm text-slate-500">Sin archivos seleccionados</span>
                   </div>
                   <p className="text-xs text-slate-500">Formato recomendado: PNG o JPG, tamaño máximo 2MB</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-700/50"></div>

            {/* Customization Section */}
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Color del menú lateral</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={config.colorMenu}
                      onChange={(e) => handleInputChange('colorMenu', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-slate-700 cursor-pointer bg-slate-900"
                    />
                    <input 
                      type="text" 
                      value={config.colorMenu}
                      onChange={(e) => handleInputChange('colorMenu', e.target.value)}
                      className="flex-1 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                    <button 
                      onClick={() => handleInputChange('colorMenu', '#1a73e8')}
                      className="px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      Restaurar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">El cambio se aplicará inmediatamente en el menú lateral</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Color de botones</label>
                  <p className="text-xs text-slate-400 mb-2">Personaliza el color de todos los botones principales de la plataforma</p>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={config.colorBotones}
                      onChange={(e) => handleInputChange('colorBotones', e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-slate-700 cursor-pointer bg-slate-900"
                    />
                    <input 
                      type="text" 
                      value={config.colorBotones}
                      onChange={(e) => handleInputChange('colorBotones', e.target.value)}
                      className="flex-1 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                    <button 
                      onClick={() => handleInputChange('colorBotones', '#0B66FF')}
                      className="px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                      Restaurar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">El cambio se aplicará inmediatamente en todos los botones</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">Activar WhatsApp</h4>
                  <p className="text-sm text-slate-400">Habilita la integración con WhatsApp para tu academia</p>
                </div>
                <button
                  onClick={() => handleInputChange('whatsAppActivado', !config.whatsAppActivado)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    config.whatsAppActivado ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      config.whatsAppActivado ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700/50">
                <div>
                  <h4 className="text-base font-semibold text-white mb-1">Activar Partidas</h4>
                  <p className="text-sm text-slate-400">Gestiona múltiples centros de costo para organizar tus ingresos y egresos</p>
                </div>
                <button
                  onClick={() => handleInputChange('partidasActivado', !config.partidasActivado)}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                    config.partidasActivado ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      config.partidasActivado ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyConfig;
