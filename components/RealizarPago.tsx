
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface RealizarPagoProps {
  recibo: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentMethod {
  id: number;
  nombre: string;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2332] border border-slate-700 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Registrar Pago</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="mb-6 bg-[#0f1729] p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Recibo:</span>
            <span className="text-white font-semibold">#{recibo.numero || recibo.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Alumno:</span>
            <span className="text-white font-semibold">{recibo.alumnoNombre || recibo.AlumnoNombre || '-'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-slate-400">Total Recibo:</span>
            <span className="text-white font-semibold">${recibo.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg border-t border-slate-700 pt-2 mt-2">
            <span className="text-white font-bold">Saldo Pendiente:</span>
            <span className="text-red-400 font-bold">${saldoPendiente.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Monto a Pagar *
            </label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Método de Pago *
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Seleccionar método de pago</option>
              {paymentMethods.map(pm => (
                <option key={pm.id} value={pm.id}>{pm.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Referencia (opcional)
            </label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Número de transacción, cheque, etc."
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RealizarPago;
