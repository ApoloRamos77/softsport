import React, { useState, useEffect, useCallback } from 'react';
import { apiService, PeriodoPago } from '../services/api';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const estadoConfig: Record<string, { color: string; bg: string; icon: string; badge: string }> = {
    Pagado: { color: '#28a745', bg: '#d4edda', icon: '✓', badge: 'success' },
    Pendiente: { color: '#856404', bg: '#fff3cd', icon: '⏳', badge: 'warning' },
    Vencido: { color: '#721c24', bg: '#f8d7da', icon: '⚠', badge: 'danger' },
    Exonerado: { color: '#6c757d', bg: '#e2e3e5', icon: '○', badge: 'secondary' },
};

interface AlumnoSimple {
    id: number;
    nombre: string;
    apellido: string;
    fechaInscripcion?: string;
    categoriaId?: number;
    categoria?: { id?: number; nombre: string };
}

interface GenerarModalState {
    open: boolean;
    alumnoId: number | null;
    alumnoNombre: string;
    montoMensual: number;
    diaVencimiento: number;
}

const PeriodosPagoManagement: React.FC = () => {
    const [periodos, setPeriodos] = useState<PeriodoPago[]>([]);
    const [vencidos, setVencidos] = useState<PeriodoPago[]>([]);
    const [alumnos, setAlumnos] = useState<AlumnoSimple[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroAlumnoId, setFiltroAlumnoId] = useState<string>('');
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [filtroAnio, setFiltroAnio] = useState<number>(new Date().getFullYear());
    const [searchAlumno, setSearchAlumno] = useState('');
    const [vistaActiva, setVistaActiva] = useState<'cuadricula' | 'lista'>('cuadricula');
    const [generarModal, setGenerarModal] = useState<GenerarModalState>({
        open: false, alumnoId: null, alumnoNombre: '', montoMensual: 0, diaVencimiento: 10
    });
    const [editandoPeriodo, setEditandoPeriodo] = useState<PeriodoPago | null>(null);
    const [alertaVisible, setAlertaVisible] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'danger'; texto: string } | null>(null);
    const [generarTodosModal, setGenerarTodosModal] = useState(false);
    const [generarTodosOpts, setGenerarTodosOpts] = useState({ montoMensual: 0, diaVencimiento: 10 });
    // Filters for the vencidos panel
    const [vencidosSearchAlumno, setVencidosSearchAlumno] = useState('');
    const [vencidosCategoria, setVencidosCategoria] = useState('');

    const anioActual = new Date().getFullYear();
    const anios = Array.from({ length: 5 }, (_, i) => anioActual - 2 + i);

    // Derived: unique categories from loaded alumnos
    const categoriasDisponibles = Array.from(
        new Map(
            alumnos
                .filter(a => a.categoria?.nombre)
                .map(a => [a.categoria!.nombre, a.categoria!.nombre])
        ).values()
    ).sort();

    // Derived: vencidos filtered by alumno name and category
    const alumnoMap = new Map(alumnos.map(a => [a.id, a]));
    const vencidosFiltrados = vencidos.filter(p => {
        const alumno = alumnoMap.get(p.alumnoId);
        const nombreCompleto = (p.alumnoNombre || '').toLowerCase();
        if (vencidosSearchAlumno && !nombreCompleto.includes(vencidosSearchAlumno.toLowerCase())) return false;
        if (vencidosCategoria) {
            const cat = alumno?.categoria?.nombre || '';
            if (cat !== vencidosCategoria) return false;
        }
        return true;
    });

    const mostrarMensaje = (tipo: 'success' | 'danger', texto: string) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje(null), 4000);
    };

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filtroAlumnoId) params.alumnoId = filtroAlumnoId;
            if (filtroEstado) params.estado = filtroEstado;
            if (filtroAnio) params.anio = filtroAnio;
            params.pageSize = 500;

            const [periodosRes, vencidosRes, alumnosRes] = await Promise.all([
                apiService.getPeriodosPago(params),
                apiService.getPeriodosVencidos(),
                apiService.getAlumnos({ pageSize: 500 })
            ]);

            setPeriodos(periodosRes.data || []);
            setVencidos(vencidosRes.data || []);
            setAlumnos((alumnosRes.data || []).filter((a: any) => a.id != null) as AlumnoSimple[]);
        } catch (err) {
            console.error('Error cargando períodos:', err);
        } finally {
            setLoading(false);
        }
    }, [filtroAlumnoId, filtroEstado, filtroAnio]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const handleGenerarTodos = async () => {
        setProcesando(true);
        try {
            const res = await apiService.generarTodosPeriodos(generarTodosOpts);
            mostrarMensaje('success', res.message || 'Períodos generados correctamente');
            setGenerarTodosModal(false);
            cargarDatos();
        } catch (err: any) {
            mostrarMensaje('danger', err.message || 'Error generando períodos');
        } finally {
            setProcesando(false);
        }
    };

    const handleGenerarPeriodos = async () => {
        if (!generarModal.alumnoId) return;
        setProcesando(true);
        try {
            const res = await apiService.generarPeriodos(generarModal.alumnoId, {
                montoMensual: generarModal.montoMensual,
                diaVencimiento: generarModal.diaVencimiento,
            });
            mostrarMensaje('success', res.message || 'Períodos generados correctamente');
            setGenerarModal(g => ({ ...g, open: false }));
            cargarDatos();
        } catch (err: any) {
            mostrarMensaje('danger', err.message || 'Error generando períodos');
        } finally {
            setProcesando(false);
        }
    };

    const handleCambiarEstado = async (periodo: PeriodoPago, nuevoEstado: string) => {
        try {
            await apiService.updatePeriodoPago(periodo.id!, { ...periodo, estado: nuevoEstado });
            mostrarMensaje('success', `Período actualizado a "${nuevoEstado}"`);
            cargarDatos();
        } catch (err: any) {
            mostrarMensaje('danger', err.message || 'Error actualizando período');
        }
    };

    const handleEliminar = async (id: number) => {
        if (!confirm('¿Eliminar este período?')) return;
        try {
            await apiService.deletePeriodoPago(id);
            mostrarMensaje('success', 'Período eliminado');
            cargarDatos();
        } catch (err: any) {
            mostrarMensaje('danger', err.message || 'Error eliminando período');
        }
    };

    const handleGuardarEdicion = async () => {
        if (!editandoPeriodo?.id) return;
        setProcesando(true);
        try {
            await apiService.updatePeriodoPago(editandoPeriodo.id, editandoPeriodo);
            mostrarMensaje('success', 'Período actualizado correctamente');
            setEditandoPeriodo(null);
            cargarDatos();
        } catch (err: any) {
            mostrarMensaje('danger', err.message || 'Error guardando cambios');
        } finally {
            setProcesando(false);
        }
    };

    // Group periods by student for grid view
    const alumnosFiltrados = alumnos.filter(a => {
        if (!searchAlumno) return true;
        const q = searchAlumno.toLowerCase();
        return `${a.nombre} ${a.apellido}`.toLowerCase().includes(q);
    });

    const periodosPorAlumno = (alumnoId: number) =>
        periodos.filter(p => p.alumnoId === alumnoId);

    const getPeriodoMes = (alumnoId: number, mes: number) =>
        periodos.find(p => p.alumnoId === alumnoId && p.mes === mes && p.anio === filtroAnio);

    const alumnosConPeriodos = filtroAlumnoId
        ? alumnosFiltrados.filter(a => a.id === parseInt(filtroAlumnoId))
        : alumnosFiltrados.filter(a => periodosPorAlumno(a.id).length > 0);

    return (
        <div style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1 fw-bold text-white">
                        <i className="bi bi-calendar-check me-2 text-primary"></i>
                        Gestión de Períodos de Pago
                    </h4>
                    <small className="text-secondary">Control mensual de mensualidades por alumno</small>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setGenerarTodosModal(true)}
                        title="Generar períodos para todos los alumnos activos"
                    >
                        <i className="bi bi-magic me-1"></i>Generar para Todos
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setVistaActiva(vistaActiva === 'cuadricula' ? 'lista' : 'cuadricula')}
                    >
                        <i className={`bi bi-${vistaActiva === 'cuadricula' ? 'list-ul' : 'grid-3x3-gap'} me-1`}></i>
                        {vistaActiva === 'cuadricula' ? 'Vista Lista' : 'Vista Cuadrícula'}
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={cargarDatos}>
                        <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
                    </button>
                </div>
            </div>

            {/* Mensaje flash */}
            {mensaje && (
                <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
                    {mensaje.texto}
                    <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
                </div>
            )}

            {/* Panel de Alertas - Vencidos */}
            {vencidos.length > 0 && alertaVisible && (
                (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Filter strictly overdue vs informative
                    const realVencidos = vencidos.filter(p => {
                        if (!p.fechaVencimiento) return false;
                        const d = new Date(p.fechaVencimiento);
                        d.setHours(0, 0, 0, 0);
                        return d < today;
                    });

                    const isStrictlyOverdue = realVencidos.length > 0;
                    const alertClass = isStrictlyOverdue ? 'danger' : 'warning';
                    const iconClass = isStrictlyOverdue ? 'exclamation-triangle-fill' : 'info-circle-fill';
                    const titleText = isStrictlyOverdue
                        ? `${realVencidos.length} Período${realVencidos.length !== 1 ? 's' : ''} Vencido${realVencidos.length !== 1 ? 's' : ''}`
                        : `${vencidos.length} Período${vencidos.length !== 1 ? 's' : ''} con observación`;

                    return (
                        <div className={`card border-${alertClass} mb-4`} style={{ backgroundColor: '#2d1b1b' }}>
                            <div className="card-header" style={{ backgroundColor: isStrictlyOverdue ? '#3d1f1f' : '#3d3a1f', borderColor: isStrictlyOverdue ? '#dc3545' : '#ffc107' }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className={`fw-bold text-${alertClass}`}>
                                        <i className={`bi bi-${iconClass} me-2`}></i>
                                        {isStrictlyOverdue ? '⚠ ' : ''}{titleText}
                                        {vencidosFiltrados.length !== vencidos.length && (
                                            <span className="text-white-50 ms-2" style={{ fontSize: '12px' }}>({vencidosFiltrados.length} mostrados)</span>
                                        )}
                                    </span>
                                    <button className={`btn btn-sm btn-outline-${alertClass}`} onClick={() => setAlertaVisible(false)}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                                {/* Filters inside the panel */}
                                <div className="d-flex gap-2 flex-wrap">
                                    <div className="position-relative" style={{ flex: '1 1 180px', maxWidth: '260px' }}>
                                        <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}></i>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Buscar alumno..."
                                            value={vencidosSearchAlumno}
                                            onChange={e => setVencidosSearchAlumno(e.target.value)}
                                            style={{ paddingLeft: '1.8rem', backgroundColor: '#2d1b1b', borderColor: '#6b2020', color: 'white', fontSize: '12px' }}
                                        />
                                    </div>
                                    <select
                                        className="form-select form-select-sm"
                                        value={vencidosCategoria}
                                        onChange={e => setVencidosCategoria(e.target.value)}
                                        style={{ flex: '1 1 150px', maxWidth: '200px', backgroundColor: '#2d1b1b', borderColor: '#6b2020', color: 'white', fontSize: '12px' }}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categoriasDisponibles.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    {(vencidosSearchAlumno || vencidosCategoria) && (
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            style={{ fontSize: '11px' }}
                                            onClick={() => { setVencidosSearchAlumno(''); setVencidosCategoria(''); }}
                                        >
                                            <i className="bi bi-x-circle me-1"></i>Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                                    <table className="table table-sm mb-0" style={{ fontSize: '13px' }}>
                                        <thead style={{ backgroundColor: '#2d1b1b', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th className="text-danger ps-3">Alumno</th>
                                                <th className="text-danger">Período</th>
                                                <th className="text-danger">Vencimiento</th>
                                                <th className="text-danger">Monto</th>
                                                <th className="text-danger">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vencidosFiltrados.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center text-secondary py-3" style={{ fontSize: '12px' }}>No hay períodos vencidos con los filtros aplicados</td></tr>
                                            ) : vencidosFiltrados.map(p => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const d = p.fechaVencimiento ? new Date(p.fechaVencimiento) : null;
                                                if (d) d.setHours(0, 0, 0, 0);

                                                const isOverdue = d && d < today;
                                                const rowClass = isOverdue ? 'text-danger' : 'text-warning';

                                                return (
                                                    <tr key={p.id}>
                                                        <td className="ps-3 text-white">{p.alumnoNombre}</td>
                                                        <td className={rowClass}>{MESES_FULL[p.mes - 1]} {p.anio}</td>
                                                        <td className={rowClass}>
                                                            {p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString('es-PE') : '-'}
                                                            {!isOverdue && <span className="badge bg-secondary ms-2" style={{ fontSize: '9px' }}>ALN</span>}
                                                        </td>
                                                        <td className="text-white">
                                                            {p.monto > 0 ? `S/. ${p.monto.toFixed(2)}` : '-'}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-xs btn-success"
                                                                style={{ fontSize: '11px', padding: '2px 8px' }}
                                                                onClick={() => handleCambiarEstado(p, 'Pagado')}
                                                            >
                                                                ✓ Marcar Pagado
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}

            {/* Filtros */}
            <div className="card mb-4" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                <div className="card-body py-3">
                    {/* Quick-filter chips */}
                    <div className="d-flex gap-2 mb-3 flex-wrap">
                        <button
                            className={`btn btn-sm ${filtroEstado === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setFiltroEstado('')}
                        >
                            Todos
                        </button>
                        <button
                            className={`btn btn-sm ${filtroEstado === 'Vencido' ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => setFiltroEstado('Vencido')}
                        >
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Vencidos
                            {vencidos.length > 0 && (
                                <span className="badge bg-white text-danger ms-1" style={{ fontSize: '10px' }}>{vencidos.length}</span>
                            )}
                        </button>
                        <button
                            className={`btn btn-sm ${filtroEstado === 'Pendiente' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setFiltroEstado('Pendiente')}
                        >
                            <i className="bi bi-clock me-1"></i>Pendientes
                        </button>
                        <button
                            className={`btn btn-sm ${filtroEstado === 'Pagado' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setFiltroEstado('Pagado')}
                        >
                            <i className="bi bi-check-circle me-1"></i>Pagados
                        </button>
                    </div>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label text-secondary small fw-bold">Buscar Alumno</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Nombre del alumno..."
                                value={searchAlumno}
                                onChange={e => setSearchAlumno(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-secondary small fw-bold">Alumno Específico</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroAlumnoId}
                                onChange={e => setFiltroAlumnoId(e.target.value)}
                            >
                                <option value="">Todos los alumnos</option>
                                {alumnos.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label text-secondary small fw-bold">Año</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroAnio}
                                onChange={e => setFiltroAnio(parseInt(e.target.value))}
                            >
                                {anios.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label text-secondary small fw-bold">Estado</label>
                            <select
                                className="form-select form-select-sm"
                                value={filtroEstado}
                                onChange={e => setFiltroEstado(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
                                <option value="Vencido">Vencido</option>
                                <option value="Exonerado">Exonerado</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-outline-primary btn-sm w-100" onClick={cargarDatos}>
                                <i className="bi bi-funnel me-1"></i>Filtrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leyenda de estados */}
            <div className="d-flex gap-3 mb-3 flex-wrap">
                {Object.entries(estadoConfig).map(([estado, cfg]) => (
                    <div key={estado} className="d-flex align-items-center gap-1">
                        <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: cfg.color }}></div>
                        <small className="text-secondary">{estado}</small>
                    </div>
                ))}
                <div className="d-flex align-items-center gap-1">
                    <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: '#30363d' }}></div>
                    <small className="text-secondary">Sin período</small>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="text-secondary mt-2">Cargando períodos...</div>
                </div>
            ) : vistaActiva === 'cuadricula' ? (
                /* ===== VISTA CUADRÍCULA ===== */
                <div className="card" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                    <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0d1117' }}>
                        <span className="fw-bold text-white">
                            <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>
                            Cuadrícula Mensual — {filtroAnio}
                        </span>
                        <span className="badge bg-secondary">{alumnosConPeriodos.length} alumno(s)</span>
                    </div>
                    <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                        {alumnosConPeriodos.length === 0 ? (
                            <div className="text-center py-5 text-secondary">
                                <i className="bi bi-calendar-x d-block h2 mb-2 opacity-25"></i>
                                No hay períodos registrados para los filtros seleccionados.
                                <div className="mt-3">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            const primer = alumnos[0];
                                            if (primer) setGenerarModal({ open: true, alumnoId: primer.id, alumnoNombre: `${primer.nombre} ${primer.apellido}`, montoMensual: 0, diaVencimiento: 10 });
                                        }}
                                    >
                                        <i className="bi bi-magic me-1"></i>Generar Períodos
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <table className="table table-sm mb-0" style={{ fontSize: '12px', minWidth: '900px' }}>
                                <thead style={{ backgroundColor: '#0d1117', position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th className="text-secondary ps-3 py-3" style={{ minWidth: '160px' }}>Alumno</th>
                                        {MESES.map((m, i) => (
                                            <th key={i} className="text-center text-secondary py-3" style={{ minWidth: '55px' }}>{m}</th>
                                        ))}
                                        <th className="text-secondary py-3 pe-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosConPeriodos.map(alumno => (
                                        <tr key={alumno.id} style={{ borderBottom: '1px solid #21262d' }}>
                                            <td className="ps-3 py-2 text-white fw-bold align-middle" style={{ fontSize: '12px' }}>
                                                <div>{alumno.nombre} {alumno.apellido}</div>
                                                <div className="text-secondary" style={{ fontSize: '10px' }}>
                                                    {periodosPorAlumno(alumno.id).filter(p => p.anio === filtroAnio && p.estado === 'Pagado').length}/12 pagados
                                                </div>
                                            </td>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => {
                                                const p = getPeriodoMes(alumno.id, mes);
                                                let cfg = p ? estadoConfig[p.estado] : null;

                                                // Strict overdue check for visual representation
                                                if (p && p.estado !== 'Pagado' && p.estado !== 'Exonerado') {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);

                                                    let d = null;
                                                    if (p.fechaVencimiento) {
                                                        const parts = String(p.fechaVencimiento).split('T')[0].split('-');
                                                        if (parts.length === 3) {
                                                            d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                                                        } else {
                                                            d = new Date(p.fechaVencimiento);
                                                            d.setHours(0, 0, 0, 0);
                                                        }
                                                    }

                                                    if (d && d < today) {
                                                        cfg = estadoConfig.Vencido;
                                                    } else {
                                                        // If not strictly overdue, show as Pendiente (informative/in-progress)
                                                        // even if status is 'Vencido'
                                                        cfg = estadoConfig.Pendiente;
                                                    }
                                                }
                                                return (
                                                    <td key={mes} className="text-center py-2 align-middle">
                                                        {p ? (
                                                            <div
                                                                title={`${MESES_FULL[mes - 1]} ${filtroAnio} — ${p.estado}${p.monto > 0 ? ` — S/. ${p.monto.toFixed(2)}` : ''}`}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 6,
                                                                    backgroundColor: cfg!.color,
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '14px',
                                                                    cursor: 'pointer',
                                                                    transition: 'transform 0.1s',
                                                                }}
                                                                onClick={() => setEditandoPeriodo(p)}
                                                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                                                                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                            >
                                                                {cfg!.icon}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                title={`${MESES_FULL[mes - 1]} ${filtroAnio} — Sin período`}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: 6,
                                                                    backgroundColor: '#21262d',
                                                                    color: '#6c757d',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                }}
                                                                onClick={() => {
                                                                    // Compute smart defaults from alumno's inscription date
                                                                    const alumnoData = alumnos.find(a => a.id === alumno.id);
                                                                    const today = new Date();
                                                                    const defaultStart = alumnoData?.fechaInscripcion
                                                                        ? alumnoData.fechaInscripcion.split('T')[0]
                                                                        : new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                                                                    const startDate = new Date(defaultStart);
                                                                    const dueDate = new Date(startDate);
                                                                    dueDate.setDate(dueDate.getDate() + 30);
                                                                    setEditandoPeriodo({
                                                                        alumnoId: alumno.id,
                                                                        alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                                                                        anio: filtroAnio,
                                                                        mes,
                                                                        monto: 0,
                                                                        estado: 'Pendiente',
                                                                        fechaInicio: defaultStart,
                                                                        fechaVencimiento: dueDate.toISOString().split('T')[0]
                                                                    });
                                                                }}
                                                            >
                                                                +
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="pe-3 py-2 align-middle">
                                                <button
                                                    className="btn btn-xs btn-outline-primary"
                                                    style={{ fontSize: '11px', padding: '2px 8px' }}
                                                    onClick={() => setGenerarModal({
                                                        open: true,
                                                        alumnoId: alumno.id,
                                                        alumnoNombre: `${alumno.nombre} ${alumno.apellido}`,
                                                        montoMensual: 0,
                                                        diaVencimiento: 10
                                                    })}
                                                    title="Generar períodos automáticamente"
                                                >
                                                    <i className="bi bi-magic"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                /* ===== VISTA LISTA ===== */
                <div className="card" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                    <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0d1117' }}>
                        <span className="fw-bold text-white">
                            <i className="bi bi-list-ul me-2 text-primary"></i>
                            Lista de Períodos
                        </span>
                        <span className="badge bg-secondary">{periodos.length} período(s)</span>
                    </div>
                    <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                        {periodos.length === 0 ? (
                            <div className="text-center py-5 text-secondary">
                                <i className="bi bi-calendar-x d-block h2 mb-2 opacity-25"></i>
                                No hay períodos para mostrar.
                            </div>
                        ) : (
                            <table className="table table-sm mb-0 align-middle" style={{ fontSize: '13px' }}>
                                <thead style={{ backgroundColor: '#0d1117' }}>
                                    <tr>
                                        <th className="text-secondary ps-3">Alumno</th>
                                        <th className="text-secondary">Período</th>
                                        <th className="text-secondary">Vencimiento</th>
                                        <th className="text-secondary">Monto</th>
                                        <th className="text-secondary">Estado</th>
                                        <th className="text-secondary">Recibo</th>
                                        <th className="text-secondary pe-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periodos.map(p => {
                                        const cfg = estadoConfig[p.estado] || estadoConfig.Pendiente;
                                        return (
                                            <tr key={p.id} style={{ borderBottom: '1px solid #21262d' }}>
                                                <td className="ps-3 text-white fw-bold">{p.alumnoNombre}</td>
                                                <td className="text-white">{MESES_FULL[p.mes - 1]} {p.anio}</td>
                                                <td className="text-secondary">
                                                    {p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString('es-PE') : '-'}
                                                </td>
                                                <td className="text-white">
                                                    {p.monto > 0 ? `S/. ${p.monto.toFixed(2)}` : '-'}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge bg-${cfg.badge}`}
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        {cfg.icon} {p.estado}
                                                    </span>
                                                </td>
                                                <td className="text-secondary">
                                                    {p.reciboNumero ? `#${p.reciboNumero}` : '-'}
                                                </td>
                                                <td className="pe-3">
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            className="btn btn-xs btn-outline-secondary"
                                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                                            onClick={() => setEditandoPeriodo(p)}
                                                            title="Editar"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        {p.estado !== 'Pagado' && (
                                                            <button
                                                                className="btn btn-xs btn-success"
                                                                style={{ fontSize: '11px', padding: '2px 6px' }}
                                                                onClick={() => handleCambiarEstado(p, 'Pagado')}
                                                                title="Marcar como pagado"
                                                            >
                                                                ✓
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-xs btn-outline-danger"
                                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                                            onClick={() => handleEliminar(p.id!)}
                                                            title="Eliminar"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* ===== MODAL: Generar Períodos ===== */}
            {generarModal.open && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                            <div className="modal-header" style={{ borderColor: '#30363d' }}>
                                <h5 className="modal-title text-white">
                                    <i className="bi bi-magic me-2 text-primary"></i>
                                    Generar Períodos de Pago
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setGenerarModal(g => ({ ...g, open: false }))}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info" style={{ fontSize: '13px' }}>
                                    <i className="bi bi-info-circle me-1"></i>
                                    Se generarán períodos mensuales desde la <strong>fecha de inscripción</strong> del alumno hasta el mes actual, omitiendo los que ya existen.
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Alumno</label>
                                    <div className="text-white fw-bold">{generarModal.alumnoNombre}</div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Monto Mensual (S/.)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={generarModal.montoMensual}
                                        onChange={e => setGenerarModal(g => ({ ...g, montoMensual: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00 (dejar en 0 si varía)"
                                    />
                                    <small className="text-secondary">Dejar en 0 para definir el monto individualmente después.</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Día de Vencimiento</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        max="28"
                                        value={generarModal.diaVencimiento}
                                        onChange={e => setGenerarModal(g => ({ ...g, diaVencimiento: parseInt(e.target.value) || 10 }))}
                                    />
                                    <small className="text-secondary">Día del mes en que vence cada mensualidad.</small>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderColor: '#30363d' }}>
                                <button className="btn btn-secondary" onClick={() => setGenerarModal(g => ({ ...g, open: false }))}>
                                    Cancelar
                                </button>
                                <button className="btn btn-primary" onClick={handleGenerarPeriodos} disabled={procesando}>
                                    {procesando ? <><span className="spinner-border spinner-border-sm me-1"></span>Generando...</> : <><i className="bi bi-magic me-1"></i>Generar Períodos</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== MODAL: Editar / Crear Período ===== */}
            {editandoPeriodo && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                            <div className="modal-header" style={{ borderColor: '#30363d' }}>
                                <h5 className="modal-title text-white">
                                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                                    {editandoPeriodo.id ? 'Editar Período' : 'Nuevo Período'}
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setEditandoPeriodo(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-2 text-white fw-bold">
                                    {editandoPeriodo.alumnoNombre} — {MESES_FULL[(editandoPeriodo.mes || 1) - 1]} {editandoPeriodo.anio}
                                </div>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label text-secondary small fw-bold">Estado</label>
                                        <select
                                            className="form-select"
                                            value={editandoPeriodo.estado}
                                            onChange={e => setEditandoPeriodo(p => ({ ...p!, estado: e.target.value as any }))}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Pagado">Pagado</option>
                                            <option value="Vencido">Vencido</option>
                                            <option value="Exonerado">Exonerado</option>
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label text-secondary small fw-bold">Monto (S/.)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            step="0.01"
                                            value={editandoPeriodo.monto}
                                            onChange={e => setEditandoPeriodo(p => ({ ...p!, monto: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-secondary small fw-bold">
                                            <i className="bi bi-calendar-event me-1 text-info"></i>
                                            Fecha de Inicio del Período
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editandoPeriodo.fechaInicio ? editandoPeriodo.fechaInicio.split('T')[0] : ''}
                                            onChange={e => {
                                                const newStart = e.target.value;
                                                // Auto-suggest due date as +30 days from start
                                                let newDue = editandoPeriodo.fechaVencimiento;
                                                if (newStart) {
                                                    const d = new Date(newStart);
                                                    d.setDate(d.getDate() + 30);
                                                    newDue = d.toISOString().split('T')[0];
                                                }
                                                setEditandoPeriodo(p => ({ ...p!, fechaInicio: newStart, fechaVencimiento: newDue }));
                                            }}
                                        />
                                        <small className="text-secondary" style={{ fontSize: '11px' }}>
                                            Por defecto: fecha de inscripción del alumno (o 1º del mes actual si no tiene).
                                        </small>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-secondary small fw-bold">
                                            <i className="bi bi-calendar-x me-1 text-warning"></i>
                                            Fecha de Vencimiento
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={editandoPeriodo.fechaVencimiento ? editandoPeriodo.fechaVencimiento.split('T')[0] : ''}
                                            onChange={e => setEditandoPeriodo(p => ({ ...p!, fechaVencimiento: e.target.value }))}
                                        />
                                        <small className="text-secondary" style={{ fontSize: '11px' }}>
                                            Sugerido: 30 días después de la fecha de inicio. Editable.
                                        </small>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-secondary small fw-bold">Observaciones</label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={editandoPeriodo.observaciones || ''}
                                            onChange={e => setEditandoPeriodo(p => ({ ...p!, observaciones: e.target.value }))}
                                            placeholder="Notas adicionales..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderColor: '#30363d' }}>
                                <button className="btn btn-secondary" onClick={() => setEditandoPeriodo(null)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={async () => {
                                    if (editandoPeriodo.id) {
                                        await handleGuardarEdicion();
                                    } else {
                                        // Create new period
                                        setProcesando(true);
                                        try {
                                            await apiService.createPeriodoPago(editandoPeriodo);
                                            mostrarMensaje('success', 'Período creado correctamente');
                                            setEditandoPeriodo(null);
                                            cargarDatos();
                                        } catch (err: any) {
                                            mostrarMensaje('danger', err.message || 'Error creando período');
                                        } finally {
                                            setProcesando(false);
                                        }
                                    }
                                }} disabled={procesando}>
                                    {procesando ? <><span className="spinner-border spinner-border-sm me-1"></span>Guardando...</> : <><i className="bi bi-check-circle me-1"></i>Guardar</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ===== MODAL: Generar para Todos ===== */}
            {generarTodosModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}>
                            <div className="modal-header" style={{ borderColor: '#30363d' }}>
                                <h5 className="modal-title text-white">
                                    <i className="bi bi-magic me-2 text-success"></i>
                                    Generar Períodos para Todos los Alumnos
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setGenerarTodosModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-warning" style={{ fontSize: '13px' }}>
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    Se generarán períodos mensuales para <strong>todos los alumnos activos</strong> desde su fecha de inscripción hasta el mes actual. Los períodos ya existentes no serán duplicados.
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Monto Mensual (S/.) — Opcional</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={generarTodosOpts.montoMensual}
                                        onChange={e => setGenerarTodosOpts(o => ({ ...o, montoMensual: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00 (dejar en 0 si varía por alumno)"
                                    />
                                    <small className="text-secondary">Dejar en 0 para definir el monto individualmente después.</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-secondary small fw-bold">Día de Vencimiento</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        max="28"
                                        value={generarTodosOpts.diaVencimiento}
                                        onChange={e => setGenerarTodosOpts(o => ({ ...o, diaVencimiento: parseInt(e.target.value) || 10 }))}
                                    />
                                    <small className="text-secondary">Día del mes en que vence cada mensualidad (1-28).</small>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderColor: '#30363d' }}>
                                <button className="btn btn-secondary" onClick={() => setGenerarTodosModal(false)}>Cancelar</button>
                                <button className="btn btn-success" onClick={handleGenerarTodos} disabled={procesando}>
                                    {procesando
                                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Generando...</>
                                        : <><i className="bi bi-magic me-1"></i>Generar para Todos</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeriodosPagoManagement;
