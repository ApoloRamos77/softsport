import React, { useState, useEffect } from 'react';
import NutritionalManager from './NutritionalManagement/NutritionalManager';
import { Alumno, HistorialMedico, apiService } from '../services/api';

const NutritionalManagementPage: React.FC = () => {
    // State
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [grupoFiltro, setGrupoFiltro] = useState('Todos los grupos');
    const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableGroups, setAvailableGroups] = useState<{ id: number, nombre: string }[]>([]);
    const [availableCategories, setAvailableCategories] = useState<{ id: number, nombre: string }[]>([]);
    const [historialMap, setHistorialMap] = useState<Map<number, HistorialMedico>>(new Map());

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalAlumnos, setTotalAlumnos] = useState(0);

    // Load alumnos
    const loadAlumnos = async () => {
        setLoading(true);
        setError(null);
        try {
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
                estado: 'Activo', // Solo alumnos activos
                grupoId: grupoId,
                categoriaId: categoriaId
            };

            const result = await apiService.getAlumnos(params);
            setAlumnos(result.data);
            setTotalAlumnos(result.totalCount);

            // Load medical history for each student
            const historialPromises = result.data.map(async (alumno) => {
                if (alumno.id) {
                    try {
                        const historial = await apiService.getHistorialByAlumno(alumno.id);
                        if (historial.length > 0) {
                            return { id: alumno.id, data: historial[0] }; // Latest record
                        }
                    } catch (err) {
                        console.error(`Error loading history for student ${alumno.id}:`, err);
                    }
                }
                return null;
            });

            const historialResults = await Promise.all(historialPromises);
            const newHistorialMap = new Map<number, HistorialMedico>();
            historialResults.forEach(result => {
                if (result) {
                    newHistorialMap.set(result.id, result.data);
                }
            });
            setHistorialMap(newHistorialMap);

        } catch (err) {
            console.error('Error loading alumnos:', err);
            setError('No se pudo cargar la lista de alumnos. Verifique su conexión o intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Load filters
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

    // Load filters initially
    useEffect(() => {
        loadFilters();
    }, []);

    // Load alumnos when parameters change
    useEffect(() => {
        loadAlumnos();
    }, [currentPage, itemsPerPage, searchTerm, grupoFiltro, categoriaFiltro]);

    // Reset page when filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, grupoFiltro, categoriaFiltro, itemsPerPage]);

    // Get nutritional status based on IMC
    const getNutritionalStatus = (imc: number | undefined) => {
        if (!imc) return { label: 'Sin Datos', color: 'text-secondary', icon: '⚪' };
        if (imc < 18.5) return { label: 'Bajo Peso', color: 'text-warning', icon: '🟡' };
        if (imc >= 18.5 && imc <= 24.9) return { label: 'Normal', color: 'text-success', icon: '🟢' };
        if (imc >= 25 && imc <= 29.9) return { label: 'Sobrepeso', color: 'text-orange', icon: '🟠' };
        return { label: 'Obesidad', color: 'text-danger', icon: '🔴' };
    };

    // Pagination
    const totalPages = Math.max(1, Math.ceil(totalAlumnos / itemsPerPage));

    // If showing nutritional manager
    if (selectedAlumno) {
        return (
            <NutritionalManager
                alumno={selectedAlumno}
                onClose={() => setSelectedAlumno(null)}
                onUpdate={() => loadAlumnos()}
            />
        );
    }

    // Main view: Student listing
    return (
        <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-end mb-4 gap-3 flex-wrap">
                <div>
                    <h2 className="mb-1 text-white fw-bold h4">Nutrición Deportiva</h2>
                    <p className="text-secondary mb-0 small">Gestión nutricional completa de atletas</p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
                    >
                        <i className="bi bi-file-pdf"></i> Exportar PDF
                    </button>
                    <button
                        className="btn btn-sm d-flex align-items-center gap-2 text-white border-secondary border-opacity-50"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #30363d' }}
                    >
                        <i className="bi bi-graph-up"></i> Estadísticas
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
            <div className="card mb-4 border-secondary border-opacity-10 shadow-lg" style={{ backgroundColor: '#161b22' }}>
                <div className="card-body p-3">
                    <div className="row g-2 align-items-center">
                        <div className="col-lg-4 col-md-4">
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

                        <div className="col-lg-8 col-md-8">
                            <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
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
                                <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Grupo/Categoría</th>
                                <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Última Medición</th>
                                <th className="text-white border-bottom border-secondary border-opacity-25 py-3">Estado Nutricional</th>
                                <th className="text-end pe-4 text-white border-bottom border-secondary border-opacity-25 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-secondary">
                                        <div className="spinner-border text-primary mb-2" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                        <p className="mb-0">Cargando alumnos...</p>
                                    </td>
                                </tr>
                            ) : alumnos.length > 0 ? alumnos.map((a, i) => {
                                const historial = a.id ? historialMap.get(a.id) : undefined;
                                const status = getNutritionalStatus(historial?.imc);

                                return (
                                    <tr key={a.id} className="hover-bg-dark-lighter" style={{ transition: 'background-color 0.2s' }}>
                                        <td className="ps-4 text-secondary border-bottom border-secondary border-opacity-10 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="border-bottom border-secondary border-opacity-10 py-3">
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-white">{a.nombre} {a.apellido}</span>
                                                <small className="text-secondary" style={{ fontSize: '11px' }}>{a.documento || '-'}</small>
                                            </div>
                                        </td>
                                        <td className="text-secondary border-bottom border-secondary border-opacity-10 py-3">
                                            <div className="text-white small">{a.grupo?.nombre || '-'}</div>
                                            <div className="opacity-50" style={{ fontSize: '11px' }}>{a.categoria?.nombre || '-'}</div>
                                        </td>
                                        <td className="border-bottom border-secondary border-opacity-10 py-3">
                                            {historial ? (
                                                <div>
                                                    <div className="text-white small">
                                                        {new Date(historial.fechaToma).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-secondary" style={{ fontSize: '11px' }}>
                                                        {historial.peso}kg - IMC: {historial.imc?.toFixed(1)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-secondary">-</span>
                                            )}
                                        </td>
                                        <td className="border-bottom border-secondary border-opacity-10 py-3">
                                            <span className={`${status.color} d-flex align-items-center gap-2`}>
                                                <span>{status.icon}</span>
                                                <span className="small">{status.label}</span>
                                            </span>
                                        </td>
                                        <td className="text-end pe-4 border-bottom border-secondary border-opacity-10 py-3">
                                            <button
                                                onClick={() => setSelectedAlumno(a)}
                                                className="btn btn-sm btn-success d-flex align-items-center gap-2 ms-auto"
                                                title="Gestionar Nutrición"
                                            >
                                                <i className="bi bi-heart-pulse"></i>
                                                <span>Gestionar</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center">
                                            <i className="bi bi-heart-pulse text-secondary display-4 mb-3"></i>
                                            <p className="text-muted fw-medium mb-1">No se encontraron alumnos</p>
                                            <small className="text-secondary">Intenta ajustar los filtros de búsqueda</small>
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
        </div>
    );
};

export default NutritionalManagementPage;
