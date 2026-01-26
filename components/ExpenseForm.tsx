
import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';

interface Expense {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria?: string;
  referencia?: string;
  estado?: string;
}

interface ExpenseFormProps {
  expense?: Expense | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PaymentMethod {
  id: number;
  nombre: string;
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
      console.log('Cargando métodos de pago...');
      const response = await fetch('http://localhost:5081/api/paymentmethods');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Métodos de pago cargados:', data);
        setPaymentMethods(data);
      } else {
        console.error('Error al cargar métodos de pago, status:', response.status);
      }
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
      referencia: notas
    };

    console.log('Enviando egreso:', payload);

    try {
      setLoading(true);
      const url = expense 
        ? `http://localhost:5081/api/expenses/${expense.id}`
        : 'http://localhost:5081/api/expenses';
      const method = expense ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense ? { ...payload, id: expense.id, estado: expense.estado } : payload),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);

      if (response.ok) {
        alert(expense ? 'Egreso actualizado exitosamente' : 'Egreso creado exitosamente');
        onSuccess();
      } else {
        alert(`Error al ${expense ? 'actualizar' : 'crear'} el egreso: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al crear el egreso: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a2332] border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-white">{expense ? 'Editar Egreso' : 'Nuevo Egreso'}</h2>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Concepto *
            </label>
            <input 
              type="text" 
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej: Pago de servicios, Compra de materiales"
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Monto *
            </label>
            <input 
              type="number" 
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
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
                <option key={pm.id} value={pm.nombre}>{pm.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Fecha *
            </label>
            <DatePicker 
              value={fecha}
              onChange={setFecha}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-2">
              Notas
            </label>
            <textarea 
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales (opcional)"
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2.5 rounded-md text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (expense ? 'Actualizar Egreso' : 'Crear Egreso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
