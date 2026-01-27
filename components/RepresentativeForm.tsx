
import React, { useState, useEffect } from 'react';
import { Representante } from '../services/api';

interface RepresentativeFormProps {
  representative?: Representante | null;
  onCancel: () => void;
  onSave?: (data: Representante) => void;
}

const RepresentativeForm: React.FC<RepresentativeFormProps> = ({ representative, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    parentesco: 'Padre',
    direccion: ''
  });

  useEffect(() => {
    if (representative) {
      setFormData({
        nombre: representative.nombre || '',
        apellido: representative.apellido || '',
        documento: representative.documento || '',
        email: representative.email || '',
        telefono: representative.telefono || '',
        parentesco: representative.parentesco || 'Padre',
        direccion: representative.direccion || ''
      });
    }
  }, [representative]);

  const [errors, setErrors] = useState({
    email: ''
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({ email: '' });

    // Validate email
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Por favor, ingresa un correo electrónico válido.' });
      return;
    }

    if (onSave) onSave(formData);
  };

  return (

    <div className="animate-fadeIn d-flex justify-content-center py-4">
      <div className="card shadow-xl border-secondary border-opacity-25 w-100" style={{ maxWidth: '800px', backgroundColor: '#161b22' }}>
        <div className="card-header bg-transparent border-bottom border-secondary border-opacity-10 py-4 px-4">
          <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 d-block">Gestión de Familia</label>
          <h5 className="mb-1 fw-bold text-white tracking-tight">
            {representative ? 'Editar Representante' : 'Nuevo Representante'}
          </h5>
          <p className="text-secondary small mb-0">Complete la información de contacto y vinculación legal con el alumno.</p>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Datos de Identidad</label>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    placeholder="Ej: Juan"
                    className="form-control"
                    required
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    placeholder="Ej: Pérez"
                    className="form-control"
                    required
                    value={formData.apellido}
                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Documento de Identidad *</label>
                  <input
                    type="text"
                    placeholder="V-12345678"
                    className="form-control"
                    required
                    value={formData.documento}
                    onChange={e => setFormData({ ...formData, documento: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label>Parentesco / Vínculo</label>
                  <select
                    className="form-select"
                    value={formData.parentesco}
                    onChange={e => setFormData({ ...formData, parentesco: e.target.value })}
                  >
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Tío/a">Tío/a</option>
                    <option value="Representante Legal">Representante Legal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-[#0d1117] bg-opacity-30">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 d-block border-bottom border-blue-900 border-opacity-50 pb-2">Información de Contacto</label>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Cod. País</label>
                  <select className="form-select">
                    <option value="+58">VE +58</option>
                    <option value="+57">CO +57</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label>Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    placeholder="412 1234567"
                    className="form-control"
                    required
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    required
                    value={formData.email}
                    onChange={e => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ email: '' });
                    }}
                  />
                  {errors.email && (
                    <div className="invalid-feedback text-[11px] mt-1">{errors.email}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top border-secondary border-opacity-25">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
                style={{ fontSize: '13px', fontWeight: '600' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary px-5 fw-bold"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontSize: '13px' }}
              >
                {representative ? 'Actualizar Datos' : 'Registrar Representante'}
              </button>
            </div >
          </form >
        </div >
      </div >
    </div >
  );
};

export default RepresentativeForm;
