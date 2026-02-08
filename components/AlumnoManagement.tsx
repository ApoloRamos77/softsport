import React, { useState, useEffect } from 'react';
import AlumnoForm from './AlumnoForm';
import NutritionalManager from './NutritionalManagement/NutritionalManager';
import { Alumno, apiService } from '../services/api';

const AlumnoManagement: React.FC = () => {
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [managingNutritionAlumno, setManagingNutritionAlumno] = useState<Alumno | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<'Activos' | 'Inactivos' | 'Todos'>('Activos');
  const [grupoFiltro, setGrupoFiltro] = useState('Todos los grupos');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [availableGroups, setAvailableGroups] = useState<{ id: number, nombre: string }[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ id: number, nombre: string }[]>([]);

  const [totalAlumnos, setTotalAlumnos] = useState(0);

  const loadAlumnos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Traducir filtros a IDs si es necesario
      const grupoId = grupoFiltro !== 'Todos los grupos'
        ? availableGroups.find(g => g.nombre === grupoFiltro)?.id
        : undefined;
      const categoriaId = categoriaFiltro !== 'Todas'
        ? availableCategories.find(c => c.nombre === categoriaFiltro)?.id
        : undefined;

      const params = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm,
        estado: estadoFiltro === 'Todos' ? undefined : (estadoFiltro === 'Activos' ? 'Activo' : 'Inactivo'),
        grupoId: grupoId,
        categoriaId: categoriaId
      };

      const result = await apiService.getAlumnos(params);

      const normalized = result.data.map(a => ({
        ...a,
        telefono: a.telefono ?? '',
        email: a.email ?? '',
        estado: a.estado ?? 'Activo',
        fechaAnulacion: a.fechaAnulacion ?? null
      }));

      setAlumnos(normalized);
      setTotalAlumnos(result.totalCount);
    } catch (err) {
      console.error('Error loading alumnos:', err);
      setError('No se pudo cargar la lista de alumnos. Verifique su conexión o intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [groups, categories] = await Promise.all([
        apiService.getGrupos(),
        apiService.getCategorias()
      ]);
      setAvailableGroups(groups.map(g => ({ id: g.id!, nombre: g.nombre })));
      setAvailableCategories(categories.map(c => ({ id: c.id!, nombre: c.nombre })));
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  };

  // Cargar filtros inicialmente
  useEffect(() => {
    loadFilters();
  }, []);

  // Cargar alumnos cuando cambian los parámetros
  useEffect(() => {
    loadAlumnos();
  }, [currentPage, itemsPerPage, searchTerm, estadoFiltro, grupoFiltro, categoriaFiltro]);

  const handleSave = async () => {
    await loadAlumnos();
    setShowForm(false);
    setEditingAlumno(null);
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setShowForm(true);
  };

  const handleDelete = async (alumno: Alumno) => {
    if (!confirm(`¿Está seguro que desea anular al alumno "${alumno.nombre} ${alumno.apellido}"?`)) {
      return;
    }

    try {
      if (alumno.id) await apiService.deleteAlumno(alumno.id);
      loadAlumnos();
    } catch (error) {
      console.error('Error al anular alumno:', error);
      alert('Error al anular el alumno');
    }
  };

  // Paginación
  const totalPages = Math.max(1, Math.ceil(totalAlumnos / itemsPerPage));
  const paginatedAlumnos = alumnos;

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFiltro, grupoFiltro, categoriaFiltro, itemsPerPage]);

  if (showForm) {
    return (
      <AlumnoForm
        alumno={editingAlumno}
        onCancel={() => {
          setShowForm(false);
          setEditingAlumno(null);
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="mb-1 text-white fw-bold h4">Gestión de Alumnos</h2>
          <p className="text-secondary mb-0 small">Administra los expedientes y registros de los atletas</p>
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
            <i className="bi bi-plus-lg"></i> Nuevo Alumno
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger border-left-danger mb-4 mx-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button className="btn btn-link btn-sm ms-2" onClick={loadAlumnos}>Reintentar</button>
        </div>
      )}

      {/* Filters */}
      {!managingNutritionAlumno && (
        <>
          <div className="card mb-4 border-secondary border-opacity-10 shadow-lg" style={{ backgroundColor: '#161b22' }}>
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-lg-3 col-md-4">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}></i>
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      className="form-control form-control-sm"
                      style={{ paddingLeft: '2.3rem', height: '38px', fontSize: '13px' }}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-lg-9 col-md-8">
                  <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
                    <div className="d-flex align-items-center bg-dark border border-secondary border-opacity-25 rounded px-2" style={{ height: '38px', backgroundColor: '#0d1117' }}>
                      <span className="text-secondary text-[10px] font-bold uppercase me-2 tracking-wider ps-2">Estado</span>
                      <select
                        className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer pe-2"
                        value={estadoFiltro}
                        onChange={e => setEstadoFiltro(e.target.value as any)}
                        style={{ backgroundColor: '#0d1117', color: 'white' }}
                      >
                        <option value="Activos" style={{ backgroundColor: '#161b22', color: 'white' }}>Activos</option>
                        <option value="Inactivos" style={{ backgroundColor: '#161b22', color: 'white' }}>Inactivos</option>
                        <option value="Todos" style={{ backgroundColor: '#161b22', color: 'white' }}>Todos</option>
                      </select>
                    </div>

                    <div className="d-flex align-items-center bg-dark border border-secondary border-opacity-25 rounded px-2" style={{ height: '38px', backgroundColor: '#0d1117' }}>
                      <span className="text-secondary text-[10px] font-bold uppercase me-2 tracking-wider ps-2">Grupo</span>
                      <select
                        className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer pe-2"
                        style={{ backgroundColor: '#0d1117', color: 'white' }}
                        value={grupoFiltro}
                        onChange={e => setGrupoFiltro(e.target.value)}
                      >
                        <option style={{ backgroundColor: '#161b22', color: 'white' }}>Todos los grupos</option>
                        {availableGroups.map(g => (
                          <option key={g.id} value={g.nombre} style={{ backgroundColor: '#161b22', color: 'white' }}>{g.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div className="d-flex align-items-center bg-dark border border-secondary border-opacity-25 rounded px-2" style={{ height: '38px', backgroundColor: '#0d1117' }}>
                      <span className="text-secondary text-[10px] font-bold uppercase me-2 tracking-wider ps-2">Categoría</span>
                      <select
                        className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer pe-2"
                        style={{ backgroundColor: '#0d1117', color: 'white' }}
                        value={categoriaFiltro}
                        onChange={e => setCategoriaFiltro(e.target.value)}
                      >
                        <option style={{ backgroundColor: '#161b22', color: 'white' }}>Todas</option>
                        {availableCategories.map(c => (
                          <option key={c.id} value={c.nombre} style={{ backgroundColor: '#161b22', color: 'white' }}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-muted mb-3 small">
            Mostrando {alumnos.length} de {totalAlumnos} alumnos
          </div>

          {/* Table */}
          <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Nro.</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Alumno</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Fecha Nac.</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Contacto</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Posición</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Grupo/Cat</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Beca</th>
                    <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Estado</th>
                    <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-secondary">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mb-0">Cargando alumnos...</p>
                      </td>
                    </tr>
                  ) : paginatedAlumnos.length > 0 ? paginatedAlumnos.map((a, i) => (
                    <tr key={a.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                      <td className="ps-4 text-secondary border-bottom border-secondary border-opacity-10 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex flex-column">
                          <span className="fw-bold text-white">{a.nombre} {a.apellido}</span>
                          <small className="text-secondary" style={{ fontSize: '11px' }}>{a.documento || '-'}</small>
                        </div>
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        {a.fechaNacimiento ? new Date(a.fechaNacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        <div>{a.telefono || '-'}</div>
                        <small className="opacity-50" style={{ fontSize: '10px' }}>{a.email || ''}</small>
                      </td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">{a.posicion || '-'}</td>
                      <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                        <div className="text-white small">{a.grupo?.nombre || '-'}</div>
                        <div className="opacity-50" style={{ fontSize: '11px' }}>{a.categoria?.nombre || '-'}</div>
                      </td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <span className="badge bg-primary bg-opacity-20 text-white border border-primary border-opacity-30">
                          {a.beca?.nombre || (a.beca?.porcentaje !== undefined ? a.beca.porcentaje + '%' : '-')}
                        </span>
                      </td>
                      <td className="border-bottom border-secondary border-opacity-10 py-3">
                        <span className={`badge border border-opacity-30 text-white ${a.estado === 'Activo' ? 'bg-success bg-opacity-20 border-success' : 'bg-secondary bg-opacity-20 border-secondary'
                          }`}>
                          {a.estado}
                        </span>
                      </td>
                      <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            onClick={() => handleEdit(a)}
                            className="btn btn-sm text-primary p-0 me-2"
                            title="Editar"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => setManagingNutritionAlumno(a)}
                            className="btn btn-sm text-success p-0 me-2"
                            title="Gestión Nutricional"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-heart-pulse"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
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
                      <td colSpan={9} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-people text-secondary display-4 mb-3"></i>
                          <p className="text-muted fw-medium mb-1">No se encontraron alumnos</p>
                          <small className="text-secondary">Intenta ajustar los filtros o agregar un nuevo alumno</small>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="d-flex align-items-center justify-content-between mt-4 gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <div className="small text-muted">
              Página {currentPage} de {totalPages}
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
            <div className="ms-3">
              <label className="me-2 small">Alumnos por página:</label>
              <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="form-select form-select-sm d-inline-block w-auto">
                {[5, 10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Nutritional Manager Modal */}
      {managingNutritionAlumno && (
        <NutritionalManager
          alumno={managingNutritionAlumno}
          onClose={() => setManagingNutritionAlumno(null)}
          onUpdate={() => {
            loadAlumnos();
            // Optionally reload the specific student if needed, but loadAlumnos refreshes the list
          }}
        />
      )}
    </div >
  );
};

export default AlumnoManagement;
