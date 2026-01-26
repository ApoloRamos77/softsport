
import React, { useState, useEffect } from 'react';
import PaymentMethodForm from './PaymentMethodForm';

interface PaymentMethod {
  id: number;
  nombre: string;
  descripcion: string;
  moneda: string;
  estado: string;
}

const PaymentMethodManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const monedasLabels: { [key: string]: string } = {
    'USD': 'Dólares ($)',
    'PEN': 'Soles (S/.)',
    'VES': 'Bolívares (Bs.)',
    'EUR': 'Euros (€)'
  };

  const getMonedaLabel = (codigo: string) => {
    return monedasLabels[codigo] || codigo;
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = paymentMethods.filter(method =>
        method.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.moneda.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMethods(filtered);
    } else {
      setFilteredMethods(paymentMethods);
    }
  }, [searchTerm, paymentMethods]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5081/api/paymentmethods');
      const data = await response.json();
      setPaymentMethods(data);
      setFilteredMethods(data);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
      alert('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleAnular = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas anular este método de pago?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5081/api/paymentmethods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentMethods.find(m => m.id === id),
          estado: 'Inactivo'
        }),
      });

      if (!response.ok) {
        throw new Error('Error al anular el método de pago');
      }

      alert('Método de pago anulado exitosamente');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al anular el método de pago');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMethod(null);
    loadPaymentMethods();
  };

  if (showForm) {
    return <PaymentMethodForm paymentMethod={editingMethod} onCancel={handleFormClose} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nuevo Método de Pago
        </button>
      </div>

      <div className="relative max-w-sm">
        <input 
          type="text" 
          placeholder="Buscar método de pago..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2 pl-4 rounded-md text-xs w-full focus:outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 bg-slate-900/30 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              <th className="px-4 py-3 font-semibold text-center">Moneda</th>
              <th className="px-4 py-3 font-semibold text-center">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : filteredMethods.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-slate-500">
                  No se encontraron métodos de pago
                </td>
              </tr>
            ) : (
              filteredMethods.map((method) => (
                <tr key={method.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 text-white font-medium">{method.nombre}</td>
                  <td className="px-4 py-4 text-slate-300">{method.descripcion || '-'}</td>
                  <td className="px-4 py-4 text-slate-300 text-center">{getMonedaLabel(method.moneda)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      method.estado === 'Activo' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {method.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(method)}
                        disabled={method.estado === 'Inactivo'}
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleAnular(method.id)}
                        disabled={method.estado === 'Inactivo'}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Anular"
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethodManagement;
