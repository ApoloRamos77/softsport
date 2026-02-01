
import React, { useState, useEffect } from 'react';
import RepresentativeForm from './RepresentativeForm';
import { apiService, Representante, Alumno } from '../services/api';

const RepresentativeManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<Representante | null>(null);
  const [representatives, setRepresentatives] = useState<Representante[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalRepresentatives, setTotalRepresentatives] = useState(0);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm
      };

      const result = await apiService.getRepresentantes(params);
      setRepresentatives(result.data);
      setTotalRepresentatives(result.totalCount);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar la información');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepresentatives();
  }, [currentPage, itemsPerPage, searchTerm]);

  const handleSave = async (data: Representante) => {
    try {
      if (editingRepresentative?.id) {
        // Incluir el ID en los datos para la actualización
        const dataWithId = { ...data, id: editingRepresentative.id };
        await apiService.updateRepresentante(editingRepresentative.id, dataWithId);
      } else {
        await apiService.createRepresentante(data);
      }
      await loadRepresentatives();
      setShowForm(false);
      setEditingRepresentative(null);
    } catch (error) {
      console.error('Error saving representative:', error);
      alert('Error al guardar el representante');
    }
  };

  const handleEdit = (representative: Representante) => {
    setEditingRepresentative(representative);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea anular este representante?')) {
      try {
        await apiService.deleteRepresentante(id);
        await loadRepresentatives();
        alert('Representante anulado exitosamente');
      } catch (error) {
        console.error('Error deleting representative:', error);
        alert('Error al anular el representante');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRepresentative(null);
  };

  // Paginación
  const totalPages = Math.max(1, Math.ceil(totalRepresentatives / itemsPerPage));

  // Resetear página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  if (showForm) {
    return (
      <RepresentativeForm
        representative={editingRepresentative}
        onCancel={handleCancelForm}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Gestión de Representantes</h2>
            <p className="text-secondary mb-0 small">Administra los acudientes y contactos de los alumnos</p>
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
              <i className="bi bi-plus-lg"></i> Nuevo Representante
            </button>
          </div>
        </div>

        <div className="card mb-4 border-0" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3">
            <div className="d-flex align-items-center" style={{ maxWidth: '450px' }}>
              <div className="position-relative w-100">
                <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem' }}></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o documento..."
                  className="form-control form-control-sm border-secondary border-opacity-25 text-white placeholder-secondary"
                  style={{ paddingLeft: '2.5rem', backgroundColor: '#0d1117' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Representante</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Documento</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Contacto</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Parentesco</th>
                  <th className="text-center text-white border-bottom border-secondary border-opacity-25 py-3">Alumnos</th>
                  <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Fecha Registro</th>
                  <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-secondary">
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mb-0">Cargando representantes...</p>
                    </td>
                  </tr>
                ) : representatives.length > 0 ? representatives.map(r => (
                  <tr key={r.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                    <td className="ps-4 border-bottom border-secondary border-opacity-10 py-3">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-white">{r.nombre} {r.apellido}</span>
                        <small className="text-secondary" style={{ fontSize: '11px' }}>{r.email}</small>
                      </div>
                    </td>
                    <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{r.documento || '-'}</td>
                    <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{r.telefono || '-'}</td>
                    <td className="border-bottom border-secondary border-opacity-10 py-3">
                      <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1" style={{ fontSize: '11px' }}>
                        {r.parentesco}
                      </span>
                    </td>
                    <td className="text-center border-bottom border-secondary border-opacity-10 py-3">
                      <span className="badge bg-primary bg-opacity-20 text-blue-400 rounded-pill px-3 border border-primary border-opacity-30">
                        {(r as any).alumnosCount || 0}
                      </span>
                    </td>
                    <td className="text-secondary small border-bottom border-secondary border-opacity-10 py-3">
                      {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleEdit(r)}
                          className="btn btn-sm text-primary p-0 me-2"
                          title="Editar"
                          style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(r.id!)}
                          className="btn btn-sm text-danger p-0"
                          title="Anular"
                          style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-person-badge text-secondary display-4 mb-3"></i>
                        <p className="text-muted fw-medium mb-0">No se encontraron representantes</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
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

export default RepresentativeManagement;
