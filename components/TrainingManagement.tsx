import React, { useState, useEffect } from 'react';
import TrainingForm from './TrainingForm';
import TrainingConfig from './TrainingConfig';
import { apiService, Categoria, Training } from '../services/api';

const TrainingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'config'>('calendar');
  const [showForm, setShowForm] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [temporadaFiltro, setTemporadaFiltro] = useState('Todas');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [availableCategories, setAvailableCategories] = useState<Categoria[]>([]);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Training>('trainings');
      setTrainings(data);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const data = await apiService.getCategorias();
      setAvailableCategories(data);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'calendar') {
      loadTrainings();
      loadFilters();
    }
  }, [activeTab]);

  const handleSave = async () => {
    await loadTrainings();
    setShowForm(false);
    setEditingTraining(null);
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setShowForm(true);
  };

  const handleDelete = async (training: Training) => {
    if (!confirm(`¿Está seguro de anular el entrenamiento "${training.titulo}"?`)) {
      return;
    }

    try {
      await apiService.delete('trainings', training.id);
      loadTrainings();
    } catch (error) {
      console.error('Error al anular entrenamiento:', error);
      alert('Error al anular el entrenamiento');
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredTrainings = trainings.filter(t => {
    // Buscar
    const term = searchTerm.toLowerCase();
    const matchSearch = t.titulo?.toLowerCase().includes(term) ||
      t.descripcion?.toLowerCase().includes(term) ||
      t.ubicacion?.toLowerCase().includes(term);

    if (!matchSearch) return false;

    // Tipo
    if (tipoFiltro !== 'Todos' && t.tipo !== tipoFiltro) return false;

    // Categoría
    if (categoriaFiltro !== 'Todas' && t.categoria?.nombre !== categoriaFiltro) return false;

    return true;
  });

  if (showForm) {
    return (
      <TrainingForm
        training={editingTraining}
        onCancel={() => {
          setShowForm(false);
          setEditingTraining(null);
        }}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">

        {/* Header & Tabs */}
        <div className="d-flex flex-column gap-4 mb-2">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <h2 className="mb-1 text-white fw-bold h4">Gestión de Entrenamientos</h2>
              <p className="text-secondary mb-0 small">Administra los cronogramas y registros de prácticas</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-bottom border-secondary border-opacity-25">
            <ul className="nav nav-tabs border-0 gap-4">
              <li className="nav-item">
                <button
                  className={`nav-link border-0 bg-transparent px-0 pb-3 ${activeTab === 'calendar' ? 'text-white border-bottom border-2 border-primary fw-bold' : 'text-secondary hover-text-white'}`}
                  onClick={() => setActiveTab('calendar')}
                >
                  <i className="bi bi-calendar3 me-2"></i>
                  Calendario / Lista
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 bg-transparent px-0 pb-3 ${activeTab === 'config' ? 'text-white border-bottom border-2 border-primary fw-bold' : 'text-secondary hover-text-white'}`}
                  onClick={() => setActiveTab('config')}
                >
                  <i className="bi bi-gear me-2"></i>
                  Configuración Semanal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {activeTab === 'calendar' ? (
          <>
            <div className="d-flex justify-content-end mb-2">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary d-flex align-items-center gap-2 px-3"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
              >
                <i className="bi bi-plus-lg"></i> Nuevo Entrenamiento
              </button>
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
                        placeholder="Buscar entrenamiento..."
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
                        <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Temporada</span>
                        <select
                          className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer"
                          value={temporadaFiltro}
                          onChange={e => setTemporadaFiltro(e.target.value)}
                        >
                          <option style={{ backgroundColor: '#161b22' }}>Todas</option>
                          <option style={{ backgroundColor: '#161b22' }}>Temporada 2024</option>
                          <option style={{ backgroundColor: '#161b22' }}>Temporada 2025</option>
                        </select>
                      </div>

                      <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                        <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Categoría</span>
                        <select
                          className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer"
                          value={categoriaFiltro}
                          onChange={e => setCategoriaFiltro(e.target.value)}
                        >
                          <option style={{ backgroundColor: '#161b22' }}>Todas</option>
                          {availableCategories.map(cat => (
                            <option key={cat.id} value={cat.nombre} style={{ backgroundColor: '#161b22' }}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div className="d-flex align-items-center bg-[#0d1117] border border-secondary border-opacity-25 rounded px-3" style={{ height: '38px' }}>
                        <span className="text-secondary text-[10px] font-bold uppercase me-3 tracking-wider">Tipo</span>
                        <select
                          className="bg-transparent border-0 text-white text-[13px] focus:outline-none cursor-pointer"
                          value={tipoFiltro}
                          onChange={e => setTipoFiltro(e.target.value)}
                        >
                          <option style={{ backgroundColor: '#161b22' }}>Todos</option>
                          <option style={{ backgroundColor: '#161b22' }}>Técnico</option>
                          <option style={{ backgroundColor: '#161b22' }}>Físico</option>
                          <option style={{ backgroundColor: '#161b22' }}>Táctico</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                  <div className="card-body d-flex justify-content-between align-items-start p-3">
                    <div>
                      <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Total</p>
                      <h4 className="fw-bold mb-0 text-white">{trainings.length}</h4>
                      <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Sesiones registradas</small>
                    </div>
                    <div className="p-2 bg-primary bg-opacity-10 rounded text-primary border border-primary border-opacity-10">
                      <i className="bi bi-person-arms-up fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                  <div className="card-body d-flex justify-content-between align-items-start p-3">
                    <div>
                      <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Próximos</p>
                      <h4 className="fw-bold mb-0 text-info">
                        {trainings.filter(t => t.fecha && new Date(t.fecha) > new Date()).length}
                      </h4>
                      <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Esta semana</small>
                    </div>
                    <div className="p-2 bg-info bg-opacity-10 rounded text-info border border-info border-opacity-10">
                      <i className="bi bi-calendar-event fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                  <div className="card-body d-flex justify-content-between align-items-start p-3">
                    <div>
                      <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Asistencia</p>
                      <h4 className="fw-bold mb-0 text-success">0%</h4>
                      <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Promedio mensual</small>
                    </div>
                    <div className="p-2 bg-success bg-opacity-10 rounded text-success border border-success border-opacity-10">
                      <i className="bi bi-check-circle fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                  <div className="card-body d-flex justify-content-between align-items-start p-3">
                    <div>
                      <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>Eficiencia</p>
                      <h4 className="fw-bold mb-0 text-warning">0%</h4>
                      <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>Cumplimiento</small>
                    </div>
                    <div className="p-2 bg-warning bg-opacity-10 rounded text-warning border border-warning border-opacity-10">
                      <i className="bi bi-lightning-charge fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
              <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fs-6 fw-bold text-white">Listado de Entrenamientos</h5>
                  <small className="text-secondary opacity-75">{trainings.length} registros</small>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                  <thead style={{ backgroundColor: '#161b22' }}>
                    <tr>
                      <th className="ps-4 text-white border-bottom border-secondary border-opacity-25 py-3">Fecha</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Título / Ubicación</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Horario</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Categoría</th>
                      <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Estado</th>
                      <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrainings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5">
                          <div className="d-flex flex-column items-center justify-center">
                            <i className="bi bi-clipboard-x text-secondary display-4 mb-3"></i>
                            <p className="text-muted fw-medium mb-0">No se encontraron registros</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrainings.map((training) => (
                        <tr key={training.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                          <td className="ps-4 fw-semibold text-secondary border-bottom border-secondary border-opacity-10 py-3">{formatDate(training.fecha)}</td>
                          <td className="border-bottom border-secondary border-opacity-10 py-3">
                            <div className="d-flex flex-column">
                              <span className="text-white fw-bold" style={{ fontSize: '13px' }}>{training.titulo}</span>
                              <small className="text-secondary opacity-75">{training.ubicacion || '--'}</small>
                            </div>
                          </td>
                          <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                            <div className="small">{formatTime(training.horaInicio)} - {formatTime(training.horaFin)}</div>
                          </td>
                          <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">{training.categoria?.nombre || '--'}</span>
                          </td>
                          <td className="border-bottom border-secondary border-opacity-10 py-3">
                            <span className={`badge border border-opacity-30 text-white ${training.estado === 'Programado' ? 'bg-primary bg-opacity-20 border-primary' :
                              training.estado === 'Completado' ? 'bg-success bg-opacity-20 border-success' :
                                'bg-secondary bg-opacity-20 border-secondary'
                              }`}>
                              {training.estado}
                            </span>
                          </td>
                          <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                onClick={() => handleEdit(training)}
                                className="btn btn-sm text-primary p-0 me-2"
                                title="Editar"
                                style={{ backgroundColor: 'transparent', border: 'none' }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(training)}
                                className="btn btn-sm text-danger p-0"
                                title="Anular"
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
          </>
        ) : (
          <TrainingConfig />
        )}
      </div>
    </div>
  );
};

export default TrainingManagement;
