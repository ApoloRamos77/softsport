
import React, { useState, useEffect } from 'react';
import { apiService, Servicio } from '../services/api';
import ServiceForm from './ServiceForm';

const ServiceManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState<Servicio[]>([]);
  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalServices, setTotalServices] = useState(0);

  const loadServices = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm
      };
      const result = await apiService.getServicios(params);
      setServices(result.data);
      setTotalServices(result.totalCount);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleEdit = (service: Servicio) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este servicio?')) return;

    try {
      await apiService.deleteServicio(id);
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const totalPages = Math.max(1, Math.ceil(totalServices / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  if (showForm) {
    return (
      <ServiceForm
        onCancel={handleFormCancel}
        onSave={handleFormSuccess}
        serviceId={editingService?.id}
        initialData={editingService}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Servicios</h2>
            <p className="text-secondary mb-0 small">Gestiona los servicios y planes de tu academia</p>
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
              <i className="bi bi-plus-lg"></i> Nuevo Servicio
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-4">
            <div className="position-relative" style={{ maxWidth: '400px' }}>
              <i className="bi bi-search position-absolute text-secondary" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}></i>
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117', paddingLeft: '35px' }}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Nombre</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Precio</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Pronto Pago</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Recurrente</th>
                    <th className="py-3 text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Estado</th>
                    <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25 text-uppercase small font-weight-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-2" role="status"></div>
                        <p className="mb-0">Cargando...</p>
                      </td>
                    </tr>
                  ) : services.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-briefcase text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-0">No se encontraron servicios</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                        <td className="ps-4 py-3 text-white fw-medium border-bottom border-secondary border-opacity-10">
                          <div>
                            <div className="fw-bold">{service.nombre}</div>
                            {service.descripcion && <div className="text-secondary small text-truncate" style={{ maxWidth: '300px' }}>{service.descripcion}</div>}
                          </div>
                        </td>
                        <td className="py-3 text-white border-bottom border-secondary border-opacity-10">S/. {service.precio.toFixed(2)}</td>
                        <td className="py-3 text-white border-bottom border-secondary border-opacity-10">
                          {service.prontoPago ? (
                            <span className="text-success fw-bold">S/. {service.prontoPago.toFixed(2)}</span>
                          ) : (
                            <span className="text-secondary">-</span>
                          )}
                        </td>
                        <td className="py-3 border-bottom border-secondary border-opacity-10">
                          {service.recurrenteMensual ? (
                            <span className="badge bg-info text-white border border-info">Recurrente</span>
                          ) : (
                            <span className="badge bg-dark text-white border border-secondary">Único</span>
                          )}
                        </td>
                        <td className="py-3 border-bottom border-secondary border-opacity-10">
                          <span className={`badge bg-opacity-20 border border-opacity-30 text-white ${service.activo
                            ? 'bg-success border-success'
                            : 'bg-secondary border-secondary'
                            }`}>
                            {service.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="pe-4 py-3 text-end border-bottom border-secondary border-opacity-10">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="btn btn-sm text-primary p-0 me-2"
                              title="Editar"
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(service.id!)}
                              className="btn btn-sm text-danger p-0"
                              title="Eliminar"
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              <i className="bi bi-trash"></i>
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
      </div>
    </div>
  );
};

export default ServiceManagement;
