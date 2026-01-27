
import React, { useState, useEffect } from 'react';
import { apiService, Abono, PaymentMethod } from '../services/api';
import DatePicker from './DatePicker';

const AbonoManagement: React.FC = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [filteredAbonos, setFilteredAbonos] = useState<Abono[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('todos');
  const [atletaFilter, setAtletaFilter] = useState('todos');
  const [metodoFilter, setMetodoFilter] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-01-22');

  useEffect(() => {
    loadAbonos();
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, estatusFilter, atletaFilter, metodoFilter, fechaDesde, fechaHasta, abonos]);

  const loadAbonos = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAbonos();
      setAbonos(data);
    } catch (error) {
      console.error('Error cargando abonos:', error);
      // alert('Error al cargar abonos'); // Suppress alert for better UX
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

  const applyFilters = () => {
    let filtered = [...abonos];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(abono => {
        const reciboId = abono.reciboId?.toString() || '';
        const alumno = `${abono.recibo?.alumno?.nombre || ''} ${abono.recibo?.alumno?.apellido || ''}`.toLowerCase();
        return reciboId.includes(searchTerm) || alumno.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro de método de pago
    if (metodoFilter !== 'todos') {
      filtered = filtered.filter(abono => abono.paymentMethodId === parseInt(metodoFilter));
    }

    // Filtro de fechas
    if (fechaDesde) {
      filtered = filtered.filter(abono => new Date(abono.fecha) >= new Date(fechaDesde));
    }
    if (fechaHasta) {
      filtered = filtered.filter(abono => new Date(abono.fecha) <= new Date(fechaHasta + 'T23:59:59'));
    }

    setFilteredAbonos(filtered);
  };

  const getPaymentMethodName = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.nombre || '-';
  };

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
                    style={{ paddingLeft: '2.3rem', height: '38px', fontSize: '13px' }}
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
                    <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">ID Recibo</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Recibo</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Alumno</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Concepto</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Monto</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Fecha</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Método de Pago</th>
                    <th className="py-3 text-center text-white border-bottom border-secondary border-opacity-25">Estatus</th>
                    <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25">Acciones</th>
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
                  ) : filteredAbonos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-cash-coin text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-0">No se encontraron abonos</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAbonos.map((abono) => (
                      <tr key={abono.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-10 font-bold">#{abono.reciboId}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">Recibo #{abono.reciboId}</td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          {abono.recibo?.alumno
                            ? `${abono.recibo.alumno.nombre} ${abono.recibo.alumno.apellido}`
                            : '-'}
                        </td>
                        <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                          {abono.recibo?.items && abono.recibo.items.length > 0
                            ? abono.recibo.items.map(i => i.nombre || i.descripcion || '').join(', ')
                            : abono.referencia || '-'}
                        </td>
                        <td className="py-3 text-success fw-bold border-bottom border-secondary border-opacity-10">${abono.monto.toFixed(2)}</td>
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
      </div>
    </div>
  );
};

export default AbonoManagement;
