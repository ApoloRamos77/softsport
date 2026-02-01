
import React, { useState, useEffect } from 'react';
import PaymentMethodForm from './PaymentMethodForm';
import { apiService, PaymentMethod } from '../services/api';

const PaymentMethodManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<PaymentMethod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const monedasLabels: { [key: string]: string } = {
    'PEN': 'Soles (S/.)',
    'USD': 'Dólares ($)'
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
      const data = await apiService.getPaymentMethods();
      setPaymentMethods(data);
      setFilteredMethods(data);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
      // alert('Error al cargar métodos de pago');
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
      // Find current method to create payload (apiService.update usually takes full object or partial depending on implementation)
      // Our apiService.update takes full object T usually unless defined otherwise.
      // But let's check if we can just update status?
      // For safety, let's fetch full object or assume we have it.
      const method = paymentMethods.find(m => m.id === id);
      if (method) {
        await apiService.updatePaymentMethod(id, { ...method, estado: 'Inactivo' });
        alert('Método de pago anulado exitosamente');
        loadPaymentMethods();
      }
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Métodos de Pago</h2>
            <p className="text-secondary mb-0 small">Administra las formas de pago aceptadas en la academia</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Método
            </button>
          </div>
        </div>

        <div className="card border-0 mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3">
            <div className="input-group input-group-sm" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                placeholder="Buscar por nombre, descripción o moneda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
              <thead style={{ backgroundColor: '#161b22' }}>
                <tr>
                  <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Nombre</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Descripción</th>
                  <th className="text-center text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Moneda</th>
                  <th className="text-center text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Estado</th>
                  <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-secondary">
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mb-0">Cargando métodos de pago...</p>
                    </td>
                  </tr>
                ) : filteredMethods.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-credit-card text-secondary display-4 mb-3"></i>
                        <p className="text-muted fw-medium mb-0">No se encontraron métodos de pago</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMethods.map((method) => (
                    <tr key={method.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                      <td className="ps-4 fw-bold text-white border-bottom border-secondary border-opacity-10 py-3">
                        {method.nombre}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3 small">
                        {method.descripcion || '-'}
                      </td>
                      <td className="text-center text-secondary border-bottom border-secondary border-opacity-10 py-3 small">
                        {getMonedaLabel(method.moneda)}
                      </td>
                      <td className="text-center border-bottom border-secondary border-opacity-10 py-3">
                        <span className={`badge border border-opacity-30 text-white ${method.estado === 'Activo'
                          ? 'bg-success bg-opacity-20 border-success'
                          : 'bg-danger bg-opacity-20 border-danger'
                          }`} style={{ fontSize: '10px' }}>
                          {method.estado}
                        </span>
                      </td>
                      <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleEdit(method)}
                            disabled={method.estado === 'Inactivo'}
                            className="btn btn-sm text-primary p-0"
                            title="Editar"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleAnular(method.id!)}
                            disabled={method.estado === 'Inactivo'}
                            className="btn btn-sm text-danger p-0"
                            title="Anular"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-ban"></i>
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
      </div>
    </div>
  );
};

export default PaymentMethodManagement;
