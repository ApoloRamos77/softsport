
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
    <div className="bg-[#111827] rounded-lg shadow-xl border border-slate-800 p-8 max-w-4xl mx-auto animate-fadeIn">
      <h2 className="text-xl font-bold mb-8 text-white">
        {representative ? 'Editar Representante' : 'Nuevo Representante'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Nombre *</label>
            <input 
              type="text" 
              placeholder="Ej: Juan"
              className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              required
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Apellido *</label>
            <input 
              type="text" 
              placeholder="Ej: Pérez"
              className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              required
              value={formData.apellido}
              onChange={e => setFormData({...formData, apellido: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Documento de Identidad *</label>
          <input 
            type="text" 
            placeholder="Ingrese número de documento (V-12345678)"
            className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-200"
            required
            value={formData.documento}
            onChange={e => setFormData({...formData, documento: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-300">Código País</label>
            <select className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
              <option value="+58">VE +58</option>
              <option value="+51">PE +51</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-300">Teléfono *</label>
            <input 
              type="tel" 
              placeholder="4241234567"
              className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              required
              value={formData.telefono}
              onChange={e => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Email *</label>
          <input 
            type="email" 
            placeholder="correo@ejemplo.com"
            className={`bg-[#0d1117] p-3 rounded-md border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 w-full transition-all duration-200 ${errors.email ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-700'}`}
            required
            value={formData.email}
            onChange={e => {
              setFormData({...formData, email: e.target.value});
              if (errors.email) setErrors({ email: '' });
            }}
          />
          {errors.email && (
            <p className="text-red-500 text-xs font-semibold animate-shake">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Parentesco</label>
          <select 
            className="bg-[#0d1117] p-3 rounded-md border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            value={formData.parentesco}
            onChange={e => setFormData({...formData, parentesco: e.target.value})}
          >
            <option value="Padre">Padre</option>
            <option value="Madre">Madre</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tío/a">Tío/a</option>
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-10 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-10 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold shadow-lg shadow-blue-500/20"
          >
            Guardar Representante
          </button>
        </div>
      </form>
    </div>
  );
};

export default RepresentativeForm;
