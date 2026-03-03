import React, { useState, useEffect, useCallback } from 'react';
import { apiService, Alumno, TrainingAsistencia, Training } from '../services/api';

interface AsistenciaModalProps {
    training: Training;
    onClose: () => void;
}

type EstadoAsistencia = 'Presente' | 'Tardanza' | 'Ausente';

interface RegistroLocal {
    alumno: Alumno;
    estado: EstadoAsistencia;
    minutosTardanza: number;
    observaciones: string;
    mostrarObs: boolean;
}

const ESTADO_CONFIG: Record<EstadoAsistencia, { label: string; icon: string; bg: string; border: string; text: string; badge: string }> = {
    Presente: {
        label: 'Presente',
        icon: 'bi-check-circle-fill',
        bg: 'rgba(40,167,69,0.15)',
        border: '#28a745',
        text: '#28a745',
        badge: 'success',
    },
    Tardanza: {
        label: 'Tardanza',
        icon: 'bi-clock-history',
        bg: 'rgba(255,193,7,0.15)',
        border: '#ffc107',
        text: '#ffc107',
        badge: 'warning',
    },
    Ausente: {
        label: 'Ausente',
        icon: 'bi-x-circle-fill',
        bg: 'rgba(220,53,69,0.12)',
        border: '#dc3545',
        text: '#dc3545',
        badge: 'danger',
    },
};

const AsistenciaModal: React.FC<AsistenciaModalProps> = ({ training, onClose }) => {
    const [registros, setRegistros] = useState<RegistroLocal[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedResult, setSavedResult] = useState<{ presentes: number; tardanzas: number; ausentes: number } | null>(null);
    const [busqueda, setBusqueda] = useState('');

    // ─── Cargar alumnos y asistencia previa ─────────────────────
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            // Cargar alumnos activos (filtrar por categoría si el training tiene una)
            const { data: todosAlumnos } = await apiService.getAlumnos({ estado: 'Activo', pageSize: 500 });

            let alumnosFiltrados = todosAlumnos;
            // Filtrar por la misma categoría del entrenamiento (si aplica)
            const categIds: number[] = [];
            if (training.trainingCategorias && training.trainingCategorias.length > 0) {
                training.trainingCategorias.forEach(tc => { if (tc.categoriaId) categIds.push(tc.categoriaId); });
            } else if (training.categoriaId) {
                categIds.push(training.categoriaId);
            }

            if (categIds.length > 0) {
                alumnosFiltrados = todosAlumnos.filter(a => a.categoriaId && categIds.includes(a.categoriaId));
            }

            // Cargar asistencia ya registrada
            const asistenciaExistente = await apiService.getAsistenciasByTraining(training.id);
            const mapaExistente = new Map<number, TrainingAsistencia>(
                asistenciaExistente.map(a => [a.alumnoId, a])
            );

            // Construir lista
            const lista: RegistroLocal[] = alumnosFiltrados
                .sort((a, b) => `${a.apellido}${a.nombre}`.localeCompare(`${b.apellido}${b.nombre}`))
                .map(al => {
                    const prev = mapaExistente.get(al.id!);
                    return {
                        alumno: al,
                        estado: (prev?.estado as EstadoAsistencia) ?? 'Presente',
                        minutosTardanza: prev?.minutosTardanza ?? 0,
                        observaciones: prev?.observaciones ?? '',
                        mostrarObs: !!prev?.observaciones,
                    };
                });

            setRegistros(lista);
        } catch (err) {
            console.error('Error cargando datos para asistencia:', err);
        } finally {
            setLoading(false);
        }
    }, [training]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // ─── Cambiar estado individual ────────────────────────────────
    const ciclarEstado = (idx: number) => {
        const orden: EstadoAsistencia[] = ['Presente', 'Tardanza', 'Ausente'];
        setRegistros(prev => {
            const copia = [...prev];
            const actual = copia[idx].estado;
            const posicion = orden.indexOf(actual);
            copia[idx] = { ...copia[idx], estado: orden[(posicion + 1) % orden.length] };
            return copia;
        });
    };

    const setEstado = (idx: number, estado: EstadoAsistencia) => {
        setRegistros(prev => {
            const copia = [...prev];
            copia[idx] = { ...copia[idx], estado };
            return copia;
        });
    };

    const setMinutos = (idx: number, min: number) => {
        setRegistros(prev => {
            const copia = [...prev];
            copia[idx] = { ...copia[idx], minutosTardanza: min };
            return copia;
        });
    };

    const setObs = (idx: number, obs: string) => {
        setRegistros(prev => {
            const copia = [...prev];
            copia[idx] = { ...copia[idx], observaciones: obs };
            return copia;
        });
    };

    const toggleObs = (idx: number) => {
        setRegistros(prev => {
            const copia = [...prev];
            copia[idx] = { ...copia[idx], mostrarObs: !copia[idx].mostrarObs };
            return copia;
        });
    };

    // ─── Marcar todos ─────────────────────────────────────────────
    const marcarTodos = (estado: EstadoAsistencia) => {
        setRegistros(prev => prev.map(r => ({ ...r, estado })));
    };

    // ─── Guardar ─────────────────────────────────────────────────
    const handleGuardar = async () => {
        setSaving(true);
        try {
            const result = await apiService.saveAsistenciasBatch({
                trainingId: training.id,
                registros: registros.map(r => ({
                    alumnoId: r.alumno.id!,
                    estado: r.estado,
                    minutosTardanza: r.estado === 'Tardanza' ? (r.minutosTardanza || 0) : undefined,
                    observaciones: r.observaciones || undefined,
                })),
            });
            setSavedResult({ presentes: result.presentes, tardanzas: result.tardanzas, ausentes: result.ausentes });
        } catch (err: any) {
            alert(`Error al guardar: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ─── Calcular stats en tiempo real ───────────────────────────
    const stats = {
        presentes: registros.filter(r => r.estado === 'Presente').length,
        tardanzas: registros.filter(r => r.estado === 'Tardanza').length,
        ausentes: registros.filter(r => r.estado === 'Ausente').length,
        total: registros.length,
    };
    const pct = stats.total > 0 ? Math.round(((stats.presentes + stats.tardanzas) / stats.total) * 100) : 0;

    const registrosFiltrados = busqueda
        ? registros.map((r, i) => ({ ...r, _originalIdx: i })).filter(r =>
            `${r.alumno.nombre} ${r.alumno.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
        )
        : registros.map((r, i) => ({ ...r, _originalIdx: i }));

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1055 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                style={{ maxWidth: '720px' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-content" style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>

                    {/* ── Header ── */}
                    <div className="modal-header border-0 pb-0 pt-4 px-4" style={{ background: 'linear-gradient(135deg,#161b22 0%,#0d1117 100%)' }}>
                        <div className="w-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="mb-1 text-white fw-bold d-flex align-items-center gap-2">
                                        <span style={{ fontSize: '1.4rem' }}>📋</span>
                                        Pase de Lista
                                    </h5>
                                    <p className="text-secondary small mb-0">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {formatDate(training.fecha)} &nbsp;|&nbsp;
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {training.titulo}
                                    </p>
                                </div>
                                <button className="btn-close btn-close-white" onClick={onClose} />
                            </div>

                            {/* Stats bar */}
                            <div className="d-flex gap-3 mb-3">
                                {(['Presente', 'Tardanza', 'Ausente'] as EstadoAsistencia[]).map(e => {
                                    const cfg = ESTADO_CONFIG[e];
                                    const count = e === 'Presente' ? stats.presentes : e === 'Tardanza' ? stats.tardanzas : stats.ausentes;
                                    return (
                                        <button
                                            key={e}
                                            onClick={() => marcarTodos(e)}
                                            title={`Marcar todos como ${e}`}
                                            className="btn btn-sm d-flex align-items-center gap-2 px-3"
                                            style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}
                                        >
                                            <i className={`bi ${cfg.icon}`}></i>
                                            {count} {cfg.label}
                                        </button>
                                    );
                                })}
                                <div className="ms-auto d-flex align-items-center text-secondary small">
                                    <i className="bi bi-bar-chart-fill me-1 text-info"></i>
                                    <span className="text-info fw-bold">{pct}%</span>
                                    <span className="ms-1">asistencia</span>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="position-relative mb-2">
                                <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem' }}></i>
                                <input
                                    type="text"
                                    placeholder="Buscar alumno..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="form-control form-control-sm"
                                    style={{ paddingLeft: '2.2rem', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Body — lista de alumnos ── */}
                    <div className="modal-body px-2 py-2" style={{ maxHeight: '52vh', overflowY: 'auto' }}>
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status" />
                                <p className="text-secondary mt-3 small">Cargando alumnos...</p>
                            </div>
                        ) : registros.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-people text-secondary display-5"></i>
                                <p className="text-muted mt-2">No hay alumnos en esta categoría</p>
                            </div>
                        ) : savedResult ? (
                            /* ── Pantalla de confirmación ── */
                            <div className="text-center py-5 px-3">
                                <div style={{ fontSize: '3rem' }}>🎉</div>
                                <h5 className="text-white fw-bold mt-3 mb-4">Lista guardada correctamente</h5>
                                <div className="d-flex justify-content-center gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="fs-3 fw-bold text-success">{savedResult.presentes}</div>
                                        <div className="text-secondary small">Presentes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="fs-3 fw-bold text-warning">{savedResult.tardanzas}</div>
                                        <div className="text-secondary small">Tardanzas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="fs-3 fw-bold text-danger">{savedResult.ausentes}</div>
                                        <div className="text-secondary small">Ausentes</div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    {/* barra de progreso asistencia */}
                                    <div className="d-flex align-items-center gap-2 justify-content-center">
                                        <span className="text-secondary small">Asistencia:</span>
                                        <div style={{ width: '200px', height: '8px', backgroundColor: '#30363d', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.round(((savedResult.presentes + savedResult.tardanzas) / (savedResult.presentes + savedResult.tardanzas + savedResult.ausentes)) * 100)}%`, height: '100%', backgroundColor: '#28a745', borderRadius: '4px', transition: 'width 1s ease' }} />
                                        </div>
                                        <span className="text-success fw-bold small">
                                            {Math.round(((savedResult.presentes + savedResult.tardanzas) / (savedResult.presentes + savedResult.tardanzas + savedResult.ausentes)) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setSavedResult(null)}>
                                        <i className="bi bi-pencil me-1"></i> Editar lista
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={onClose}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            registrosFiltrados.map(({ _originalIdx, ...r }) => {
                                const cfg = ESTADO_CONFIG[r.estado];
                                return (
                                    <div
                                        key={r.alumno.id}
                                        className="mx-2 mb-2 px-3 py-2 rounded"
                                        style={{ backgroundColor: '#161b22', border: `1px solid ${cfg.border}30`, transition: 'border-color 0.2s' }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            {/* Avatar / Número de camiseta */}
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                                style={{ width: 38, height: 38, minWidth: 38, backgroundColor: '#21262d', fontSize: '13px', border: '1px solid #30363d' }}
                                            >
                                                {r.alumno.numeroCamiseta ? `#${r.alumno.numeroCamiseta}` : r.alumno.nombre.charAt(0).toUpperCase() + r.alumno.apellido.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Nombre */}
                                            <div className="flex-grow-1 min-w-0">
                                                <div className="text-white fw-semibold" style={{ fontSize: '13px' }}>
                                                    {r.alumno.apellido}, {r.alumno.nombre}
                                                </div>
                                                {r.estado === 'Tardanza' && (
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <label className="text-warning small mb-0" style={{ fontSize: '11px' }}>Minutos:</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={120}
                                                            value={r.minutosTardanza || ''}
                                                            onChange={e => setMinutos(_originalIdx, parseInt(e.target.value) || 0)}
                                                            className="form-control form-control-sm p-0 px-2"
                                                            style={{ width: '60px', height: '24px', fontSize: '12px', backgroundColor: '#0d1117', color: '#ffc107', border: '1px solid #ffc10750' }}
                                                            placeholder="min"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botones de estado */}
                                            <div className="d-flex gap-1">
                                                {(['Presente', 'Tardanza', 'Ausente'] as EstadoAsistencia[]).map(e => {
                                                    const c = ESTADO_CONFIG[e];
                                                    const active = r.estado === e;
                                                    return (
                                                        <button
                                                            key={e}
                                                            onClick={() => setEstado(_originalIdx, e)}
                                                            title={e}
                                                            className="btn btn-sm d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 30, height: 30, padding: 0,
                                                                backgroundColor: active ? c.bg : 'transparent',
                                                                border: `1px solid ${active ? c.border : '#30363d'}`,
                                                                color: active ? c.text : '#6e7681',
                                                                borderRadius: '6px',
                                                                transition: 'all 0.15s',
                                                            }}
                                                        >
                                                            <i className={`bi ${c.icon}`} style={{ fontSize: '14px' }}></i>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Observaciones toggle */}
                                            <button
                                                onClick={() => toggleObs(_originalIdx)}
                                                title="Observaciones"
                                                className="btn btn-sm p-0"
                                                style={{ color: r.mostrarObs ? '#58a6ff' : '#6e7681', border: 'none', backgroundColor: 'transparent', width: 24, height: 24 }}
                                            >
                                                <i className="bi bi-chat-text" style={{ fontSize: '13px' }}></i>
                                            </button>
                                        </div>

                                        {/* Campo de observaciones (expandible) */}
                                        {r.mostrarObs && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    placeholder="Observaciones (opcional)..."
                                                    value={r.observaciones}
                                                    onChange={e => setObs(_originalIdx, e.target.value)}
                                                    className="form-control form-control-sm"
                                                    style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', color: 'white', fontSize: '12px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {!savedResult && !loading && registros.length > 0 && (
                        <div
                            className="modal-footer border-0 px-4 py-3 d-flex justify-content-between align-items-center"
                            style={{ backgroundColor: '#161b22' }}
                        >
                            <div className="text-secondary small">
                                {registros.length} alumnos &nbsp;—&nbsp;
                                <span className="text-success">{stats.presentes} ✓</span> &nbsp;
                                <span className="text-warning">{stats.tardanzas} ⏱</span> &nbsp;
                                <span className="text-danger">{stats.ausentes} ✗</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button className="btn btn-secondary btn-sm" onClick={onClose}>
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                    onClick={handleGuardar}
                                    disabled={saving}
                                    style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: 600 }}
                                >
                                    {saving ? (
                                        <><span className="spinner-border spinner-border-sm" />&nbsp;Guardando...</>
                                    ) : (
                                        <><i className="bi bi-save"></i> Guardar Lista</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsistenciaModal;
