
import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
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
      const response = await fetch('http://localhost:5081/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
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
    const egresosBs = expenses.reduce((sum, e) => sum + e.monto, 0);
    const egresosDolares = 0; // Por ahora en 0
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

      const response = await fetch(`http://localhost:5081/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expense,
          estado: 'Anulado'
        }),
      });

      if (response.ok) {
        alert('Egreso anulado exitosamente');
        loadExpenses();
      } else {
        alert('Error al anular el egreso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al anular el egreso');
    }
  };

  if (showForm) {
    return <ExpenseForm expense={editingExpense} onCancel={() => { setShowForm(false); setEditingExpense(null); }} onSuccess={handleSuccess} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-start">
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors">
            <i className="fas fa-file-pdf"></i> Exportar PDF
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <i className="fas fa-plus"></i> Nuevo Egreso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Egresos en Bs.</p>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.egresosBs.toFixed(2)} Bs.</h3>
          <p className="text-xs text-slate-500">En el rango de fechas</p>
        </div>
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Egresos en $</p>
          <h3 className="text-3xl font-bold text-white mb-1">${stats.egresosDolares.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">En el rango de fechas</p>
        </div>
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Total Registros</p>
          <h3 className="text-3xl font-bold text-white mb-1">{stats.totalRegistros}</h3>
          <p className="text-xs text-slate-500">Egresos registrados</p>
        </div>
      </div>

      <div className="bg-[#1a2332] border border-slate-700 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-2">Fecha Desde</label>
            <DatePicker 
              value={filters.desde} 
              onChange={(v) => setFilters({...filters, desde: v})} 
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Fecha Hasta</label>
            <DatePicker 
              value={filters.hasta} 
              onChange={(v) => setFilters({...filters, hasta: v})} 
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-2">Método de Pago</label>
            <select 
              value={filters.metodoPago}
              onChange={(e) => setFilters({...filters, metodoPago: e.target.value})}
              className="w-full bg-[#0f1729] border border-slate-600 text-white px-3 py-2 rounded-md text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#1a2332] border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-white">Lista de Egresos</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Cargando...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No hay egresos registrados</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#0f1729] border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Concepto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Fecha</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-white font-medium">#{expense.id}</td>
                    <td className="px-6 py-4 text-slate-300">{expense.descripcion}</td>
                    <td className="px-6 py-4 text-slate-300">${expense.monto.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(expense.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {expense.estado !== 'Anulado' && (
                          <>
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Editar"
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleAnular(expense.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Anular"
                            >
                              <i className="fas fa-ban text-sm"></i>
                            </button>
                          </>
                        )}
                        {expense.estado === 'Anulado' && (
                          <span className="text-xs text-red-400 font-semibold">ANULADO</span>
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
  );
};

export default ExpenseManagement;
