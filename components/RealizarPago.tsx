
import React, { useState, useEffect } from 'react';
import { apiService, PaymentMethod } from '../services/api';

interface RealizarPagoProps {
  recibo: any;
  onClose: () => void;
  onSuccess: () => void;
}

const RealizarPago: React.FC<RealizarPagoProps> = ({ recibo, onClose, onSuccess }) => {
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [referencia, setReferencia] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const saldoPendiente = recibo.total - (recibo.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0);

  useEffect(() => {
    loadPaymentMethods();
    setMonto(saldoPendiente.toFixed(2));
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

    if (!monto || !metodoPago) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const montoNumero = parseFloat(monto);
    if (montoNumero > saldoPendiente) {
      alert('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    try {
      setLoading(true);
      await apiService.createAbono({
        reciboId: recibo.id,
        monto: montoNumero,
        paymentMethodId: parseInt(metodoPago),
        fecha: new Date().toISOString(),
        referencia: referencia || null
      });

      // Actualizar estado del recibo si se pagó completo
      if (montoNumero >= saldoPendiente) {
        await apiService.updateRecibo(recibo.id, {
          ...recibo,
          estado: 'Pagado'
        });
      }

      alert('Pago registrado exitosamente');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-secondary border-opacity-25 shadow-lg" style={{ backgroundColor: '#161b22' }}>
          <div className="modal-header border-bottom border-secondary border-opacity-10">
            <h5 className="modal-title fw-bold text-white">Registrar Pago</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Recibo:</span>
                <span className="text-white fw-bold">#{recibo.numero || recibo.id}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Alumno:</span>
                <span className="text-white fw-bold text-end ms-2">{recibo.alumnoNombre || recibo.AlumnoNombre || '-'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Total Recibo:</span>
                <span className="text-white fw-bold font-monospace">S/. {recibo.total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-2 mt-2">
                <span className="text-white fw-bold small">Saldo Pendiente:</span>
                <span className="text-danger fw-bold font-monospace">S/. {saldoPendiente.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small">Monto a Pagar *</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-secondary border-opacity-25 text-secondary">S/.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small">Método de Pago *</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="form-select bg-[#0d1117] border-secondary border-opacity-25 text-white"
                  required
                >
                  <option value="">Seleccionar método...</option>
                  {paymentMethods.map(pm => (
                    <option key={pm.id} value={pm.id} className="text-dark">
                      {pm.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small">Referencia (opcional)</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Nro. operación, cheque, etc."
                  className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-outline-secondary text-white w-50 border-opacity-25"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success text-white fw-bold w-50"
                  style={{ backgroundColor: '#238636', borderColor: '#2ea043' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : 'Registrar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealizarPago;
