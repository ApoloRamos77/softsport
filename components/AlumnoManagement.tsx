
import React, { useState, useEffect } from 'react';
import AlumnoForm from './AlumnoForm';
import { Alumno, apiService } from '../services/api';

const AlumnoManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAlumnos = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAll<Alumno>('alumnos');
      // Filtrar alumnos anulados
      const activeAlumnos = data.filter(a => !a.fechaAnulacion);
      setAlumnos(activeAlumnos);
    } catch (error) {
      console.error('Error loading alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumnos();
  }, []);

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
      await apiService.delete('alumnos', alumno.id!);
      loadAlumnos();
    } catch (error) {
      console.error('Error al anular alumno:', error);
      alert('Error al anular el alumno');
    }
  };

  const filteredAlumnos = alumnos.filter(a =>
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Filters */}
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
                <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                  <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Estado</span>
                  <select className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer">
                    <option>Activos</option>
                    <option>Inactivos</option>
                    <option>Todos</option>
                  </select>
                </div>

                <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                  <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Nivel</span>
                  <select className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer">
                    <option>Todos los niveles</option>
                    <option>Básico</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </div>

                <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                  <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Categoría</span>
                  <select className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer">
                    <option>Todas</option>
                    <option>Sub-8</option>
                    <option>Sub-10</option>
                    <option>Sub-12</option>
                    <option>Sub-15</option>
                    <option>Sub-17</option>
                    <option>Sub-20</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted mb-3 small">
        Mostrando {filteredAlumnos.length} de {alumnos.length} alumnos
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
              {filteredAlumnos.length > 0 ? filteredAlumnos.map((a, i) => (
                <tr key={a.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                  <td className="ps-4 text-secondary border-bottom border-secondary border-opacity-10 py-3">{i + 1}</td>
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
                  <td colSpan={12} className="text-center py-5">
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
      <div className="d-flex align-items-center justify-content-between mt-4">
        <button className="btn btn-sm btn-outline-secondary" disabled>
          Anterior
        </button>
        <div className="small text-muted">
          Página 1 de 1
        </div>
        <button className="btn btn-sm btn-outline-secondary" disabled>
          Siguiente
        </button>
      </div>
    </div >
  );
};

export default AlumnoManagement;
