
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

interface ServiceFormProps {
  onCancel: () => void;
  onSave?: () => void;
  serviceId?: number;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onCancel, onSave, serviceId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    prontoPago: '',
    recurrenteMensual: false,
    activo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const service = await db.getServicio(serviceId!);
      setFormData({
        nombre: service.nombre,
        descripcion: service.descripcion || '',
        precio: service.precio.toString(),
        prontoPago: service.prontoPago?.toString() || '',
        recurrenteMensual: service.recurrenteMensual,
        activo: service.activo
      });
    } catch (error) {
      console.error('Error loading service:', error);
      alert('Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.precio) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const serviceData = {
        id: serviceId,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        precio: parseFloat(formData.precio),
        prontoPago: formData.prontoPago ? parseFloat(formData.prontoPago) : undefined,
        recurrenteMensual: formData.recurrenteMensual,
        activo: formData.activo
      };

      if (serviceId) {
        await db.updateServicio(serviceId, serviceData);
      } else {
        await db.createServicio(serviceData);
      }
      
      onSave?.();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  if (loading && serviceId) {
    return (
      <div className="bg-[#111827] rounded-lg shadow-xl border border-slate-800 p-8">
        <p className="text-center text-slate-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-lg shadow-xl border border-slate-800 p-8 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-8 text-white">
        {serviceId ? 'Editar Servicio' : 'Crear Servicio'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="bg-[#0d1117] border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 p-3 rounded-md text-white w-full outline-none transition-colors"
            placeholder="Ingrese el nombre del servicio"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Descripción</label>
          <textarea 
            rows={4}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="bg-[#0d1117] border border-slate-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 p-3 rounded-md text-white w-full resize-none outline-none transition-colors"
            placeholder="Descripción del servicio..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">
            Precio ($) <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            className="bg-[#0d1117] border border-slate-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 p-3 rounded-md text-white w-full outline-none transition-colors"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-300">Precio con Pronto Pago ($)</label>
          <input 
            type="number" 
            step="0.01"
            min="0"
            value={formData.prontoPago}
            onChange={(e) => setFormData({ ...formData, prontoPago: e.target.value })}
            className="bg-[#0d1117] border border-slate-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 p-3 rounded-md text-white w-full outline-none transition-colors"
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold text-slate-300">Recurrente Mensual</span>
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, recurrenteMensual: !formData.recurrenteMensual })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.recurrenteMensual ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.recurrenteMensual ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-10 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-8 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (serviceId ? 'Guardar Cambios' : 'Crear Servicio')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
