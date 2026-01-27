
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="mb-4">
        <h2 className="text-white fw-bold h4 mb-1">Configuración de la Academia</h2>
        <p className="text-secondary mb-0 small">Personaliza la información, apariencia y funciones avanzadas</p>
      </div>

      {/* Tabs */}
      <div className="d-flex p-1 rounded-3 mb-4 gap-1" style={{ backgroundColor: '#161b22', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('general')}
          className={`btn btn-sm px-4 py-2 border-0 fw-bold transition-all ${activeTab === 'general' ? 'btn-primary shadow-sm' : 'text-secondary'}`}
          style={activeTab === 'general' ? { backgroundColor: '#1f6feb' } : {}}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`btn btn-sm px-4 py-2 border-0 fw-bold transition-all ${activeTab === 'branding' ? 'btn-primary shadow-sm' : 'text-secondary'}`}
          style={activeTab === 'branding' ? { backgroundColor: '#1f6feb' } : {}}
        >
          Branding
        </button>
        <button
          onClick={() => setActiveTab('avanzado')}
          className={`btn btn-sm px-4 py-2 border-0 fw-bold transition-all ${activeTab === 'avanzado' ? 'btn-primary shadow-sm' : 'text-secondary'}`}
          style={activeTab === 'avanzado' ? { backgroundColor: '#1f6feb' } : {}}
        >
          Avanzado
        </button>
      </div>

      <div className="card border-0 shadow-lg" style={{ backgroundColor: '#161b22' }}>
        <div className="card-body p-4 p-md-5">
          {activeTab === 'general' ? (
            <div className="animate-fadeIn">
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Nombre de la Academia</label>
                  <input
                    type="text"
                    value={config.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    value={config.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@academia.com"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={config.telefono || ''}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="+51977816213"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold mb-1">Dirección Física</label>
                  <input
                    type="text"
                    value={config.direccion || ''}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Puente Piedra, Lima, Peru"
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end pt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary px-5 py-2 fw-bold"
                  style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Guardando...
                    </>
                  ) : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          ) : activeTab === 'branding' ? (
            <div className="animate-fadeIn">
              {/* Logo Section */}
              <div className="mb-5 pb-4 border-bottom border-secondary border-opacity-10">
                <div className="d-flex align-items-center gap-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-lg" style={{ width: '80px', height: '80px', backgroundColor: '#1f6feb' }}>
                    <i className="bi bi-building fs-1"></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-white fw-bold mb-2">Logo de la Academia</p>
                    <div className="d-flex align-items-center gap-3">
                      <label className="btn btn-sm btn-outline-secondary border-opacity-25 text-white px-3">
                        Actualizar Logo
                        <input type="file" className="hidden" accept="image/*" style={{ display: 'none' }} />
                      </label>
                      <span className="text-secondary small">PNG o JPG. Máx 2MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Section */}
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Color del menú lateral</label>
                  <div className="input-group">
                    <input
                      type="color"
                      value={config.colorMenu}
                      onChange={(e) => handleInputChange('colorMenu', e.target.value)}
                      className="form-control-color bg-[#0d1117] border-secondary border-opacity-25 rounded-start py-1"
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      value={config.colorMenu}
                      onChange={(e) => handleInputChange('colorMenu', e.target.value)}
                      className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white font-monospace"
                    />
                    <button
                      onClick={() => handleInputChange('colorMenu', '#1a73e8')}
                      className="btn btn-outline-secondary border-opacity-25 text-secondary small"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label text-secondary small fw-bold mb-1">Color de botones</label>
                  <div className="input-group">
                    <input
                      type="color"
                      value={config.colorBotones}
                      onChange={(e) => handleInputChange('colorBotones', e.target.value)}
                      className="form-control-color bg-[#0d1117] border-secondary border-opacity-25 rounded-start py-1"
                      style={{ width: '60px' }}
                    />
                    <input
                      type="text"
                      value={config.colorBotones}
                      onChange={(e) => handleInputChange('colorBotones', e.target.value)}
                      className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white font-monospace"
                    />
                    <button
                      onClick={() => handleInputChange('colorBotones', '#0B66FF')}
                      className="btn btn-outline-secondary border-opacity-25 text-secondary small"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end pt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary px-5 py-2 fw-bold"
                  style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between p-4 rounded-3 border border-secondary border-opacity-10" style={{ backgroundColor: '#0d1117' }}>
                  <div>
                    <h5 className="text-white fw-bold mb-1 fs-6">Notificaciones vía WhatsApp</h5>
                    <p className="text-secondary mb-0 small">Habilita el envío automático de recibos y avisos por WhatsApp</p>
                  </div>
                  <div className="form-check form-switch pe-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={config.whatsAppActivado}
                      onChange={() => handleInputChange('whatsAppActivado', !config.whatsAppActivado)}
                      style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between p-4 rounded-3 border border-secondary border-opacity-10" style={{ backgroundColor: '#0d1117' }}>
                  <div>
                    <h5 className="text-white fw-bold mb-1 fs-6">Gestión por Partidas/Presupuestos</h5>
                    <p className="text-secondary mb-0 small">Activa el control avanzado de centros de costo contables</p>
                  </div>
                  <div className="form-check form-switch pe-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={config.partidasActivado}
                      onChange={() => handleInputChange('partidasActivado', !config.partidasActivado)}
                      style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end pt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary px-5 py-2 fw-bold"
                  style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademyConfig;
