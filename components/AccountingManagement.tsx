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
  const [filters, setFilters] = useState({
    desde: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    hasta: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecibo, setSelectedRecibo] = useState<Recibo | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [editingRecibo, setEditingRecibo] = useState<Recibo | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRecibos, setTotalRecibos] = useState(0);
  const [grandStats, setGrandStats] = useState({
    montoFacturado: 0,
    montoRecaudado: 0,
    montoExonerado: 0,
    montoPorRecaudar: 0
  });

  const loadRecibos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm,
        desde: filters.desde,
        hasta: filters.hasta
      };
      const result = await apiService.getRecibos(params);
      setRecibos(result.data);
      setTotalRecibos(result.totalCount);
      if ((result as any).stats) {
        setGrandStats((result as any).stats);
      }
    } catch (error) {
      console.error('Error cargando recibos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecibos();
  }, [currentPage, itemsPerPage, searchTerm, filters.desde, filters.hasta]);

  const handleEdit = async (recibo: Recibo) => {
    if (recibo.estado === 'Pagado') {
      alert('No se puede editar un recibo que ya está pagado');
      return;
    }

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

  // Paginación
  const totalPages = Math.max(1, Math.ceil(totalRecibos / itemsPerPage));

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters.desde, filters.hasta, itemsPerPage]);

  if (showForm) {
    return <ReceiptForm recibo={editingRecibo} onCancel={handleFormClose} />;
  }

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
                <h3 className="fw-bold mb-0 text-white font-monospace">S/. {(grandStats.montoFacturado || 0).toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Total histórico</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Recaudado</p>
                <h3 className="fw-bold mb-0 text-success font-monospace">S/. {(grandStats.montoRecaudado || 0).toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Ingresos netos</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Exonerado</p>
                <h3 className="fw-bold mb-0 text-white font-monospace">S/. {(grandStats.montoExonerado || 0).toFixed(2)}</h3>
                <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Descuentos y becas</small>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
              <div className="card-body p-3">
                <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Por Recaudar</p>
                <h3 className="fw-bold mb-0 text-danger font-monospace">S/. {(grandStats.montoPorRecaudar || 0).toFixed(2)}</h3>
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
                placeholder="Buscar por ID, alumno o concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <div className="d-flex align-items-center gap-2 bg-[#0d1117] border border-secondary border-opacity-10 rounded px-2 py-1">
                <i className="bi bi-calendar-range text-secondary small"></i>
                <span className="text-secondary small fw-bold" style={{ fontSize: '10px' }}>Desde:</span>
                <input
                  type="date"
                  value={filters.desde}
                  onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
                  className="bg-transparent border-0 text-white small focus-none"
                  style={{ width: '120px', fontSize: '11px' }}
                />
              </div>
              <div className="d-flex align-items-center gap-2 bg-[#0d1117] border border-secondary border-opacity-10 rounded px-2 py-1">
                <i className="bi bi-calendar-range text-secondary small"></i>
                <span className="text-secondary small fw-bold" style={{ fontSize: '10px' }}>Hasta:</span>
                <input
                  type="date"
                  value={filters.hasta}
                  onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
                  className="bg-transparent border-0 text-white small focus-none"
                  style={{ width: '120px', fontSize: '11px' }}
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
                        S/. {(recibo.subtotal || 0).toFixed(2)}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        S/. {(recibo.descuento || 0).toFixed(2)}
                      </td>
                      <td className="text-center text-secondary border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        S/. {recibo.abonos ? recibo.abonos.reduce((sum: number, a: any) => sum + (a.monto || 0), 0).toFixed(2) : '0.00'}
                      </td>
                      <td className="text-center fw-bold text-white border-bottom border-secondary border-opacity-10 py-3 font-monospace">
                        S/. {(recibo.total || 0).toFixed(2)}
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

        {/* Pagination Controls */}
        <div className="d-flex align-items-center justify-content-between mt-2 gap-2">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm text-white border-secondary border-opacity-25"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <div className="small text-secondary">
              Página <span className="text-white fw-bold">{currentPage}</span> de <span className="text-white fw-bold">{totalPages}</span>
            </div>
            <button
              className="btn btn-sm text-white border-secondary border-opacity-25"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="text-secondary small">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="form-select form-select-sm border-secondary border-opacity-25 text-white"
              style={{ backgroundColor: '#0d1117', width: 'auto' }}
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n} style={{ backgroundColor: '#161b22' }}>{n}</option>
              ))}
            </select>
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
