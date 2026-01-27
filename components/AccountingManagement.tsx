import React, { useState, useEffect } from 'react';
import ReceiptForm from './ReceiptForm';
import DetalleRecibo from './DetalleRecibo';
import RealizarPago from './RealizarPago';
import { apiService } from '../services/api';

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
      setLoading(true);
      const data = await apiService.getAll<Recibo>('recibos');
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
      const data = await apiService.getById<Recibo>('recibos', recibo.id);
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
      await apiService.update('recibos', recibo.id, {
        ...recibo,
        estado: 'Anulado'
      });
      alert('Recibo anulado exitosamente');
      loadRecibos();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message || 'Error al anular el recibo');
    }
  };

  const handleVerDetalles = async (recibo: Recibo) => {
    try {
      const data = await apiService.getById<Recibo>('recibos', recibo.id);
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
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Contabilidad y Finanzas</h2>
            <p className="text-secondary mb-0 small">Control de ingresos, facturación y recibos</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
            >
              <i className="bi bi-file-earmark-pdf"></i> Exportar
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Recibo
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Monto Facturado</p>
                <h3 className="fw-bold mb-0 text-white font-monospace">${stats.montoFacturado.toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Total histórico</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Recaudado</p>
                <h3 className="fw-bold mb-0 text-success font-monospace">${stats.montoRecaudado.toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Ingresos netos</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Exonerado</p>
                <h3 className="fw-bold mb-0 text-white font-monospace">${stats.montoExonerado.toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Descuentos y becas</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Por Recaudar</p>
                <h3 className="fw-bold mb-0 text-danger font-monospace">${stats.montoPorRecaudar.toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Saldo pendiente</small>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="input-group input-group-sm" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-[#0d1117] border-secondary border-opacity-25 text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-[#0d1117] border-secondary border-opacity-25 text-white placeholder-secondary"
                placeholder="Buscar recibos..."
              />
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <div className="d-flex align-items-center gap-2 bg-[#0d1117] border border-secondary border-opacity-10 rounded px-2 py-1">
                <i className="bi bi-calendar-range text-secondary small"></i>
                <span className="text-secondary small fw-bold" style={{ fontSize: '10px' }}>Desde:</span>
                <input
                  type="text"
                  value={filters.desde}
                  onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
                  className="bg-transparent border-0 text-white small focus-none"
                  style={{ width: '80px', fontSize: '11px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2 bg-[#0d1117] border border-secondary border-opacity-10 rounded px-2 py-1">
                <i className="bi bi-calendar-range text-secondary small"></i>
                <span className="text-secondary small fw-bold" style={{ fontSize: '10px' }}>Hasta:</span>
                <input
                  type="text"
                  value={filters.hasta}
                  onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
                  className="bg-transparent border-0 text-white small focus-none"
                  style={{ width: '80px', fontSize: '11px' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
              <thead style={{ backgroundColor: '#161b22' }}>
                <tr>
                  <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">ID Recibo</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Alumno</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Concepto</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Subtotal</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Descuento</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold text-center">Abonado</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold text-center">Total</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Fecha</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Estado</th>
                  <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3 small fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-5 text-secondary">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                      <p className="mb-0 small">Cargando...</p>
                    </td>
                  </tr>
                ) : recibos.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-5">
                      <p className="text-muted mb-0 small">No se encontraron recibos</p>
                    </td>
                  </tr>
                ) : (
                  recibos.map((recibo) => (
                    <tr key={recibo.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                      <td className="ps-4 fw-bold text-white border-bottom border-secondary border-opacity-10 py-3">
                        #{recibo.id}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        {recibo.AlumnoNombre || recibo.alumnoNombre || '-'}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        <div className="text-truncate" style={{ maxWidth: '150px' }} title={recibo.items?.map((i: any) => i.nombre || i.Nombre || i.descripcion).join(', ')}>
                          {recibo.items && recibo.items.length > 0
                            ? recibo.items.map((i: any) => i.nombre || i.Nombre || i.descripcion || 'Item').join(', ')
                            : 'Sin items'}
                        </div>
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        ${recibo.subtotal.toFixed(2)}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        ${recibo.descuento.toFixed(2)}
                      </td>
                      <td className="text-center text-secondary border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        ${recibo.abonos ? recibo.abonos.reduce((sum: number, a: any) => sum + a.monto, 0).toFixed(2) : '0.00'}
                      </td>
                      <td className="text-center fw-bold text-white border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        ${recibo.total.toFixed(2)}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3 small">
                        {new Date(recibo.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <span className={`badge border border-opacity-30 text-white ${recibo.estado === 'Pagado'
                          ? 'bg-success bg-opacity-20 border-success'
                          : recibo.estado === 'Pendiente'
                            ? 'bg-warning bg-opacity-20 border-warning'
                            : 'bg-danger bg-opacity-20 border-danger'
                          }`} style={{ fontSize: '10px' }}>
                          {recibo.estado}
                        </span>
                      </td>
                      <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleVerDetalles(recibo)}
                            className="btn btn-sm text-info p-0"
                            title="Ver detalles"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {recibo.estado !== 'Anulado' && (
                            <>
                              <button
                                onClick={() => handleRealizarPago(recibo)}
                                className="btn btn-sm text-success p-0"
                                title="Registrar pago"
                                disabled={recibo.estado === 'Pagado'}
                                style={{ background: 'transparent', border: 'none' }}
                              >
                                <i className="bi bi-cash-stack"></i>
                              </button>
                              <button
                                onClick={() => handleEdit(recibo)}
                                className="btn btn-sm text-primary p-0"
                                title="Editar"
                                disabled={recibo.estado === 'Pagado'}
                                style={{ background: 'transparent', border: 'none' }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleAnular(recibo)}
                                className="btn btn-sm text-danger p-0"
                                title="Anular"
                                disabled={recibo.estado === 'Pagado'}
                                style={{ background: 'transparent', border: 'none' }}
                              >
                                <i className="bi bi-slash-circle"></i>
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
    </div >
  );
};

export default AccountingManagement;
