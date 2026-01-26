import React, { useState, useEffect } from 'react';
import ReceiptForm from './ReceiptForm';
import DetalleRecibo from './DetalleRecibo';
import RealizarPago from './RealizarPago';

interface Recibo {
  id: number;
  numero?: string;
  destinatarioType?: string;
  destinatarioId?: number;
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: string;
  alumnoNombre?: string;
  AlumnoNombre?: string;
  items?: any[];
  abonos?: any[];
}

const AccountingManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ desde: '01/01/2026', hasta: '22/01/2026' });
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [editingRecibo, setEditingRecibo] = useState<Recibo | null>(null);

  useEffect(() => {
    loadRecibos();
  }, []);

  const loadRecibos = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/recibos');
      const data = await response.json();
      setRecibos(data);
    } catch (error) {
      console.error('Error cargando recibos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (recibo: Recibo) => {
    if (recibo.estado === 'Pagado') {
      alert('No se puede editar un recibo que ya está pagado');
      return;
    }
    
    // Cargar el recibo completo con todos sus detalles
    try {
      const response = await fetch(`http://localhost:5081/api/recibos/${recibo.id}`);
      const data = await response.json();
      setEditingRecibo(data);
      setShowForm(true);
    } catch (error) {
      console.error('Error cargando recibo:', error);
      alert('Error al cargar el recibo para editar');
    }
  };

  const handleAnular = async (recibo: Recibo) => {
    if (!confirm('¿Estás seguro de que deseas anular este recibo?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5081/api/recibos/${recibo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recibo,
          estado: 'Anulado'
        }),
      });

      if (response.ok) {
        alert('Recibo anulado exitosamente');
        loadRecibos();
      } else {
        alert('Error al anular el recibo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al anular el recibo');
    }
  };

  const handleVerDetalles = async (recibo: Recibo) => {
    try {
      const response = await fetch(`http://localhost:5081/api/recibos/${recibo.id}`);
      const data = await response.json();
      setSelectedRecibo(data);
      setShowDetalles(true);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar los detalles del recibo');
    }
  };

  const handleRealizarPago = (recibo: Recibo) => {
    if (recibo.estado === 'Pagado') {
      alert('Este recibo ya está pagado');
      return;
    }
    if (recibo.estado === 'Anulado') {
      alert('No se pueden registrar pagos en recibos anulados');
      return;
    }
    setSelectedRecibo(recibo);
    setShowPago(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecibo(null);
    loadRecibos();
  };

  if (showForm) {
    return <ReceiptForm recibo={editingRecibo} onCancel={handleFormClose} />;
  }

  const calcularEstadisticas = () => {
    const montoFacturado = recibos.reduce((sum, r) => sum + r.subtotal, 0);
    const montoRecaudado = recibos
      .filter(r => r.estado === 'Pagado')
      .reduce((sum, r) => sum + r.total, 0);
    const montoExonerado = recibos.reduce((sum, r) => sum + r.descuento, 0);
    const montoPorRecaudar = recibos
      .filter(r => r.estado === 'Pendiente')
      .reduce((sum, r) => sum + r.total, 0);

    return { montoFacturado, montoRecaudado, montoExonerado, montoPorRecaudar };
  };

  const stats = calcularEstadisticas();

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
            <i className="fas fa-plus"></i> Nuevo Recibo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Monto Facturado</p>
          <h3 className="text-3xl font-bold text-white mb-1">${stats.montoFacturado.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">En el rango de fechas</p>
        </div>
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Monto Recaudado</p>
          <h3 className="text-3xl font-bold text-green-400 mb-1">${stats.montoRecaudado.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">Pagos confirmados</p>
        </div>
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Monto Exonerado</p>
          <h3 className="text-3xl font-bold text-white mb-1">${stats.montoExonerado.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">Por becas aplicadas</p>
        </div>
        <div className="bg-[#1a2332] border border-slate-700 p-5 rounded-lg">
          <p className="text-xs text-slate-400 font-semibold mb-2">Monto por Recaudar</p>
          <h3 className="text-3xl font-bold text-red-400 mb-1">${stats.montoPorRecaudar.toFixed(2)}</h3>
          <p className="text-xs text-slate-500">Saldo pendiente</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <input 
            type="text" 
            placeholder="Buscar por ID, alumno o concepto..." 
            className="bg-[#0f1419] p-2.5 pl-4 rounded-md border border-slate-700 text-sm w-full text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select className="bg-[#0f1419] p-2.5 rounded-md border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500">
          <option>Todos</option>
        </select>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0f1419] border border-slate-700 rounded-md px-3 py-2">
            <i className="fas fa-calendar text-slate-400 text-sm"></i>
            <span className="text-xs text-slate-400 font-medium">Desde:</span>
            <input 
              type="text"
              value={filters.desde}
              onChange={(e) => setFilters({...filters, desde: e.target.value})}
              className="bg-transparent text-white text-sm w-24 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#0f1419] border border-slate-700 rounded-md px-3 py-2">
            <i className="fas fa-calendar text-slate-400 text-sm"></i>
            <span className="text-xs text-slate-400 font-medium">Hasta:</span>
            <input 
              type="text"
              value={filters.hasta}
              onChange={(e) => setFilters({...filters, hasta: e.target.value})}
              className="bg-transparent text-white text-sm w-24 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1a2332] border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 bg-[#0f1419] border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 font-semibold text-xs">ID Recibo</th>
                <th className="px-6 py-3 font-semibold text-xs">Alumno</th>
                <th className="px-6 py-3 font-semibold text-xs">Concepto</th>
                <th className="px-6 py-3 font-semibold text-xs">Total Servicio</th>
                <th className="px-6 py-3 font-semibold text-xs">Exonerado</th>
                <th className="px-6 py-3 font-semibold text-xs">Abonado</th>
                <th className="px-6 py-3 font-semibold text-xs">Por Pagar</th>
                <th className="px-6 py-3 font-semibold text-xs">Fecha</th>
                <th className="px-6 py-3 font-semibold text-xs">Estado</th>
                <th className="px-6 py-3 font-semibold text-xs text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-slate-400">
                    Cargando...
                  </td>
                </tr>
              ) : recibos.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">No se encontraron recibos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recibos.map((recibo) => (
                  <tr key={recibo.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">#{recibo.id}</td>
                    <td className="px-6 py-4 text-slate-300">{recibo.AlumnoNombre || recibo.alumnoNombre || '-'}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {recibo.items && recibo.items.length > 0 
                        ? recibo.items.map((i: any) => i.nombre || i.Nombre || i.descripcion || 'Item').join(', ') 
                        : 'Sin items'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">${recibo.subtotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-300">${recibo.descuento.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-300">
                      ${recibo.abonos ? recibo.abonos.reduce((sum: number, a: any) => sum + a.monto, 0).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">${recibo.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(recibo.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        recibo.estado === 'Pagado' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : recibo.estado === 'Pendiente'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {recibo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerDetalles(recibo)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver detalles"
                        >
                          <i className="fas fa-eye text-sm"></i>
                        </button>
                        {recibo.estado !== 'Anulado' && (
                          <>
                            <button
                              onClick={() => handleRealizarPago(recibo)}
                              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Registrar pago"
                              disabled={recibo.estado === 'Pagado'}
                            >
                              <i className="fas fa-dollar-sign text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(recibo)}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={recibo.estado === 'Pagado' ? 'No se puede editar un recibo pagado' : 'Editar recibo'}
                              disabled={recibo.estado === 'Pagado'}
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleAnular(recibo)}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={recibo.estado === 'Pagado' ? 'No se puede anular un recibo pagado' : 'Anular recibo'}
                              disabled={recibo.estado === 'Pagado'}
                            >
                              <i className="fas fa-ban text-sm"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetalles && selectedRecibo && (
        <DetalleRecibo
          recibo={selectedRecibo}
          onClose={() => {
            setShowDetalles(false);
            setSelectedRecibo(null);
          }}
        />
      )}

      {showPago && selectedRecibo && (
        <RealizarPago
          recibo={selectedRecibo}
          onClose={() => {
            setShowPago(false);
            setSelectedRecibo(null);
          }}
          onSuccess={() => {
            setShowPago(false);
            setSelectedRecibo(null);
            loadRecibos();
          }}
        />
      )}
    </div>
  );
};

export default AccountingManagement;
