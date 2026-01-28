
import React, { useState, useEffect } from 'react';
import { apiService, Servicio } from '../services/api';

interface ServiceFormProps {
  onCancel: () => void;
  onSave?: () => void;
  serviceId?: number;
  initialData?: Servicio | null;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onCancel, onSave, serviceId, initialData }) => {
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
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || '',
        precio: initialData.precio.toString(),
        prontoPago: initialData.prontoPago?.toString() || '',
        recurrenteMensual: initialData.recurrenteMensual,
        activo: initialData.activo
      });
    } else if (serviceId) {
      // Fallback if initialData is not provided but ID is (should be rare with new logic)
      loadService(serviceId);
    }
  }, [serviceId, initialData]);

  const loadService = async (id: number) => {
    try {
      setLoading(true);
      const service = await apiService.getServicio(id);
      if (service) {
        setFormData({
          nombre: service.nombre,
          descripcion: service.descripcion || '',
          precio: service.precio.toString(),
          prontoPago: service.prontoPago?.toString() || '',
          recurrenteMensual: service.recurrenteMensual,
          activo: service.activo
        });
      }
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
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        precio: parseFloat(formData.precio),
        prontoPago: formData.prontoPago ? parseFloat(formData.prontoPago) : undefined,
        recurrenteMensual: formData.recurrenteMensual,
        activo: formData.activo
      };

      if (serviceId) {
        await apiService.updateServicio(serviceId, { ...serviceData, id: serviceId });
        alert('Servicio actualizado exitosamente');
      } else {
        await apiService.createServicio(serviceData);
        alert('Servicio creado exitosamente');
      }

      onSave?.();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-fadeIn">
      <div className="card shadow-lg border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
        <div className="card-body p-4">
          <h2 className="text-xl font-bold mb-4 text-white">
            {serviceId ? 'Editar Servicio' : 'Crear Servicio'}
          </h2>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117' }}
                placeholder="Ingrese el nombre del servicio"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Descripción</label>
              <textarea
                rows={4}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117', resize: 'none' }}
                placeholder="Descripción del servicio..."
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">
                Precio (S/.) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text border-secondary border-opacity-25 text-secondary" style={{ backgroundColor: '#0d1117' }}>S/.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Precio con Pronto Pago (S/.)</label>
              <div className="input-group">
                <span className="input-group-text border-secondary border-opacity-25 text-secondary" style={{ backgroundColor: '#0d1117' }}>S/.</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prontoPago}
                  onChange={(e) => setFormData({ ...formData, prontoPago: e.target.value })}
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between py-2 border-top border-bottom border-secondary border-opacity-10 my-2">
              <span className="text-secondary small fw-bold">Recurrente Mensual</span>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="recurrenteSwitch"
                  checked={formData.recurrenteMensual}
                  onChange={() => setFormData({ ...formData, recurrenteMensual: !formData.recurrenteMensual })}
                  style={{ backgroundColor: formData.recurrenteMensual ? '#1f6feb' : '#30363d', borderColor: 'transparent' }}
                />
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary border-opacity-10 mb-3">
              <span className="text-secondary small fw-bold">Activo</span>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="activoSwitch"
                  checked={formData.activo}
                  onChange={() => setFormData({ ...formData, activo: !formData.activo })}
                  style={{ backgroundColor: formData.activo ? '#238636' : '#30363d', borderColor: 'transparent' }}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn btn-outline-secondary text-white border-secondary border-opacity-25 hover-bg-dark-lighter"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
              >
                {loading ? 'Guardando...' : (serviceId ? 'Guardar Cambios' : 'Crear Servicio')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
