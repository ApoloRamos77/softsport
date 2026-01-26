
import React, { useState, useEffect } from 'react';

interface PaymentMethodFormProps {
  paymentMethod?: any;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ paymentMethod, onCancel }) => {
  const isEditMode = !!paymentMethod;
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [isActive, setIsActive] = useState(true);

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

    try {
      const methodData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        moneda: moneda,
        estado: isActive ? 'Activo' : 'Inactivo'
      };

      const url = isEditMode 
        ? `http://localhost:5081/api/paymentmethods/${paymentMethod.id}`
        : 'http://localhost:5081/api/paymentmethods';

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(methodData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el método de pago`);
      }

      alert(`Método de pago ${isEditMode ? 'actualizado' : 'creado'} exitosamente`);
      onCancel();
    } catch (error: any) {
      alert(error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el método de pago`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0f1419] rounded-lg shadow-xl border border-slate-800 p-8">
      <h2 className="text-xl font-bold mb-8 text-white">
        {isEditMode ? 'Editar Método de Pago' : 'Crear Método de Pago'}
      </h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Nombre</label>
          <input 
            type="text" 
            placeholder="Ej: Transferencia Bancaria"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-3 rounded-md w-full focus:outline-none focus:border-blue-500/50"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Descripción (Opcional)</label>
          <textarea 
            rows={4}
            placeholder="Descripción del método de pago..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-3 rounded-md w-full resize-none focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white">Moneda</label>
          <select 
            value={moneda}
            onChange={(e) => setMoneda(e.target.value)}
            className="bg-[#1a2332] border border-slate-700 text-white p-3 rounded-md w-full appearance-none focus:outline-none focus:border-blue-500/50" 
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23ffffff\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', 
              backgroundSize: '1.5rem', 
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {monedasOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Estado Activo</p>
            <p className="text-xs text-slate-500">¿Este método de pago estará activo?</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-8 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all font-semibold text-sm shadow-lg shadow-blue-500/20"
          >
            {isEditMode ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentMethodForm;
