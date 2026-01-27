
import React, { useState, useEffect } from 'react';
import { apiService, PaymentMethod } from '../services/api';

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod | null;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ paymentMethod, onCancel }) => {
  const isEditMode = !!paymentMethod;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const monedasOptions = [
    { value: 'USD', label: 'Dólares ($)' },
    { value: 'PEN', label: 'Soles (S/.)' },
    { value: 'VES', label: 'Bolívares (Bs.)' },
    { value: 'EUR', label: 'Euros (€)' }
  ];

  useEffect(() => {
    if (paymentMethod) {
      setNombre(paymentMethod.nombre || '');
      setDescripcion(paymentMethod.descripcion || '');
      setMoneda(paymentMethod.moneda || 'USD');
      setIsActive(paymentMethod.estado === 'Activo');
    }
  }, [paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const methodData: PaymentMethod = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        moneda: moneda,
        estado: isActive ? 'Activo' : 'Inactivo'
      };

      if (isEditMode && paymentMethod?.id) {
        methodData.id = paymentMethod.id;
        await apiService.updatePaymentMethod(paymentMethod.id, methodData);
        alert('Método de pago actualizado exitosamente');
      } else {
        await apiService.createPaymentMethod(methodData);
        alert('Método de pago creado exitosamente');
      }

      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el método de pago`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-lg mx-auto border-0" style={{ maxWidth: '600px', backgroundColor: '#161b22' }}>
      <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
        <h5 className="mb-0 fw-bold text-white fs-6">{isEditMode ? 'Editar Método de Pago' : 'Crear Método de Pago'}</h5>
        <p className="text-secondary mb-0 small">Configura los detalles del método de pago aceptado</p>
      </div>

      <div className="card-body p-4">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Nombre</label>
            <input
              type="text"
              className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
              placeholder="Ej: Transferencia Bancaria"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Descripción (Opcional)</label>
            <textarea
              className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
              rows={3}
              placeholder="Descripción del método de pago..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label text-secondary small fw-bold mb-1">Moneda</label>
            <select
              className="form-select bg-[#0d1117] border-secondary border-opacity-25 text-white"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
            >
              {monedasOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="card border-secondary border-opacity-25 p-3 mt-2" style={{ backgroundColor: '#0d1117' }}>
            <div className="form-check form-switch d-flex justify-content-between align-items-center ps-0 mb-0">
              <label className="form-check-label text-white fw-bold mb-0" htmlFor="flexSwitchCheckDefault">
                Estado Activo
                <div className="text-secondary small fw-normal">¿Este método de pago estará disponible?</div>
              </label>
              <input
                className="form-check-input ms-0"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                style={{ width: '3em', height: '1.5em', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline-secondary border-opacity-25 text-white"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                isEditMode ? 'Actualizar Método' : 'Crear Método'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;
