
import React, { useState, useEffect } from 'react';
import { apiService, Abono, PaymentMethod } from '../services/api';
import DatePicker from './DatePicker';

const AbonoManagement: React.FC = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('todos');
  const [metodoFilter, setMetodoFilter] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadAbonos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm,
        paymentMethodId: metodoFilter !== 'todos' ? parseInt(metodoFilter) : undefined,
        desde: fechaDesde,
        hasta: fechaHasta
      };
      const result = await apiService.getAbonos(params);
      setAbonos(result.data);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error cargando abonos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const data = await apiService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    loadAbonos();
  }, [currentPage, itemsPerPage, searchTerm, metodoFilter, fechaDesde, fechaHasta]);

  // Al cambiar filtros, volver a página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, metodoFilter, fechaDesde, fechaHasta, itemsPerPage]);

  const getPaymentMethodName = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.nombre || '-';
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Abonos y Pagos</h2>
            <p className="text-secondary mb-0 small">Gestiona los abonos y pagos registrados</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
            >
              <i className="bi bi-file-pdf"></i> Exportar PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 border-secondary border-opacity-10 shadow-lg" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3">
            <div className="row g-2 align-items-center">
              {/* Search */}
              <div className="col-lg-3 col-md-4">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}></i>
                  <input
                    type="text"
                    placeholder="Buscar recibo o alumno..."
                    className="form-control form-control-sm"
                    style={{ paddingLeft: '2.3rem', height: '38px', fontSize: '13px', backgroundColor: '#0d1117', color: 'white', border: '1px solid rgba(48, 54, 61, 0.5)' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-lg-9 col-md-8">
                <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                  <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                    <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Estatus</span>
                    <select
                      value={estatusFilter}
                      onChange={(e) => setEstatusFilter(e.target.value)}
                      className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer"
                    >
                      <option value="todos">Todos</option>
                      <option value="completado">Completado</option>
                      <option value="pendiente">Pendiente</option>
                    </select>
                  </div>

                  <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                    <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Método</span>
                    <select
                      value={metodoFilter}
                      onChange={(e) => setMetodoFilter(e.target.value)}
                      className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer"
                    >
                      <option value="todos">Todos</option>
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>{method.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <div style={{ width: '135px' }}>
                      <DatePicker
                        value={fechaDesde}
                        onChange={setFechaDesde}
                        placeholder="Desde"
                      />
                    </div>
                    <span className="text-secondary small mx-1 border-0">-</span>
                    <div style={{ width: '135px' }}>
                      <DatePicker
                        value={fechaHasta}
                        onChange={setFechaHasta}
                        placeholder="Hasta"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">ID Recibo</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Recibo</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Alumno</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Concepto</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Monto</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Fecha</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Método</th>
                    <th className="py-3 text-center text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Estatus</th>
                    <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mb-0">Cargando abonos...</p>
                      </td>
                    </tr>
                  ) : abonos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-cash-coin text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-0">No se encontraron abonos</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    abonos.map((abono) => (
                      <tr key={abono.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-10 font-bold">#{abono.reciboId}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">Recibo #{abono.reciboId}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          {abono.recibo?.alumno
                            ? `${abono.recibo.alumno.nombre} ${abono.recibo.alumno.apellido}`
                            : '-'}
                        </td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          <div className="text-truncate" style={{ maxWidth: '200px' }}>
                            {abono.recibo?.items && abono.recibo.items.length > 0
                              ? abono.recibo.items.map(i => i.nombre || i.descripcion || '').join(', ')
                              : abono.referencia || '-'}
                          </div>
                        </td>
                        <td className="py-3 text-success fw-bold border-bottom border-secondary border-opacity-10">S/. {abono.monto.toFixed(2)}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          {new Date(abono.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{getPaymentMethodName(abono.paymentMethodId)}</td>
                        <td className="py-3 text-center border-bottom border-secondary border-opacity-10">
                          <span className="badge bg-success bg-opacity-20 text-white border border-success border-opacity-30 rounded-pill px-3">
                            Completado
                          </span>
                        </td>
                        <td className="pe-4 py-3 text-end border-bottom border-secondary border-opacity-10">
                          <button
                            className="btn btn-sm text-primary p-0"
                            title="Ver detalles"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
              <span className="ms-2">({totalCount} registros)</span>
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
      </div>
    </div>
  );
};

export default AbonoManagement;
