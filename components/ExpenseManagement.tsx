
import React, { useState, useEffect } from 'react';
import { apiService, Expense } from '../services/api';
import ExpenseForm from './ExpenseForm';
import DatePicker from './DatePicker';

const ExpenseManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
    metodoPago: 'Todos'
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error al cargar egresos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const calcularEstadisticas = () => {
    const egresosBs = expenses.reduce((sum, e) => sum + e.monto, 0); // Assuming monto is in Bs or base currency
    const egresosDolares = 0; // Placeholder as per original code
    const totalRegistros = expenses.length;
    return { egresosBs, egresosDolares, totalRegistros };
  };

  const stats = calcularEstadisticas();

  const handleSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
    loadExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleAnular = async (id: number) => {
    if (!confirm('¿Está seguro de anular este egreso?')) return;

    try {
      const expense = expenses.find(e => e.id === id);
      if (!expense) return;

      // Assuming updateExpense handles the PUT logic
      await apiService.updateExpense(id, {
        ...expense,
        estado: 'Anulado'
      });

      alert('Egreso anulado exitosamente');
      loadExpenses();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al anular el egreso');
    }
  };

  if (showForm) {
    return <ExpenseForm expense={editingExpense} onCancel={() => { setShowForm(false); setEditingExpense(null); }} onSuccess={handleSuccess} />;
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Egresos</h2>
            <p className="text-secondary mb-0 small">Control de gastos y salidas de la academia</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
            >
              <i className="bi bi-file-pdf"></i> Exportar PDF
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Egreso
            </button>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body">
                <p className="text-secondary small fw-bold mb-2">Egresos en Bs.</p>
                <h3 className="fs-2 fw-bold text-white mb-1">{stats.egresosBs.toFixed(2)} Bs.</h3>
                <p className="text-secondary small mb-0">En el rango de fechas</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body">
                <p className="text-secondary small fw-bold mb-2">Egresos en $</p>
                <h3 className="fs-2 fw-bold text-white mb-1">${stats.egresosDolares.toFixed(2)}</h3>
                <p className="text-secondary small mb-0">En el rango de fechas</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body">
                <p className="text-secondary small fw-bold mb-2">Total Registros</p>
                <h3 className="fs-2 fw-bold text-white mb-1">{stats.totalRegistros}</h3>
                <p className="text-secondary small mb-0">Egresos registrados</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body">
            <h6 className="text-white fw-bold mb-3">Filtros</h6>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.desde}
                  onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.hasta}
                  onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
                  className="form-control border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Método de Pago</label>
                <select
                  value={filters.metodoPago}
                  onChange={(e) => setFilters({ ...filters, metodoPago: e.target.value })}
                  className="form-select border-secondary border-opacity-25 text-white"
                  style={{ backgroundColor: '#0d1117' }}
                >
                  <option value="Todos">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
            <h6 className="mb-0 fw-bold text-white">Lista de Egresos</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              {loading ? (
                <div className="text-center py-5 text-secondary">
                  <div className="spinner-border text-primary mb-2" role="status"></div>
                  <p className="mb-0">Cargando...</p>
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-5 text-secondary">No hay egresos registrados</div>
              ) : (
                <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                  <thead style={{ backgroundColor: '#161b22' }}>
                    <tr>
                      <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">#</th>
                      <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Concepto</th>
                      <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Monto</th>
                      <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Fecha</th>
                      <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-10 font-bold">#{expense.id}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{expense.descripcion}</td>
                        <td className="py-3 text-white border-bottom border-secondary border-opacity-10">${expense.monto.toFixed(2)}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          {new Date(expense.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="pe-4 py-3 text-end border-bottom border-secondary border-opacity-10">
                          <div className="d-flex justify-content-end gap-2">
                            {expense.estado !== 'Anulado' && (
                              <>
                                <button
                                  onClick={() => handleEdit(expense)}
                                  className="btn btn-sm text-primary p-0 me-2"
                                  title="Editar"
                                  style={{ backgroundColor: 'transparent', border: 'none' }}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  onClick={() => handleAnular(expense.id!)}
                                  className="btn btn-sm text-danger p-0"
                                  title="Anular"
                                  style={{ backgroundColor: 'transparent', border: 'none' }}
                                >
                                  <i className="bi bi-x-circle"></i>
                                </button>
                              </>
                            )}
                            {expense.estado === 'Anulado' && (
                              <span className="badge bg-danger bg-opacity-20 text-white border border-danger border-opacity-30">ANULADO</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
