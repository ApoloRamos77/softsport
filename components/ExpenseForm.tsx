
import React, { useState, useEffect } from 'react';
import { apiService, Expense, PaymentMethod } from '../services/api';
import DatePicker from './DatePicker';

interface ExpenseFormProps {
  expense?: Expense | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onCancel, onSuccess }) => {
  const [concepto, setConcepto] = useState(expense?.descripcion || '');
  const [monto, setMonto] = useState(expense?.monto.toString() || '0.00');
  const [metodoPago, setMetodoPago] = useState(expense?.categoria || '');
  const [fecha, setFecha] = useState(expense?.fecha.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState(expense?.referencia || '');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await apiService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!concepto || !monto || !metodoPago || !fecha) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const payload = {
      descripcion: concepto,
      monto: parseFloat(monto),
      fecha: new Date(fecha).toISOString(),
      categoria: metodoPago,
      referencia: notas,
      estado: expense?.estado || 'Activo'
    };

    try {
      setLoading(true);

      if (expense) {
        // Since updateExpense expects ID and Data, assuming apiService has updateExpense(id, data)
        await apiService.updateExpense(expense.id!, { ...payload, id: expense.id });
        alert('Egreso actualizado exitosamente');
      } else {
        await apiService.createExpense(payload);
        alert('Egreso creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error completo:', error);
      alert(`Error al guardar el egreso`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="card shadow-lg border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
        <div className="card-body p-4">
          <h2 className="text-xl font-bold mb-4 text-white">
            {expense ? 'Editar Egreso' : 'Nuevo Egreso'}
          </h2>

          <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Concepto *</label>
              <input
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Pago de servicios, Compra de materiales"
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Monto *</label>
              <div className="input-group">
                <span className="input-group-text border-secondary border-opacity-25 text-secondary" style={{ backgroundColor: '#0d1117' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Método de Pago *</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="form-select border-secondary border-opacity-25 text-white"
                style={{ backgroundColor: '#0d1117' }}
                required
              >
                <option value="">Seleccionar método de pago</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.nombre}>{pm.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Fecha *</label>
              <DatePicker
                value={fecha}
                onChange={setFecha}
                placeholder="Seleccionar fecha"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Notas</label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales (opcional)"
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117', resize: 'none' }}
              />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCancel}
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
                {loading ? 'Guardando...' : (expense ? 'Actualizar Egreso' : 'Crear Egreso')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;
