
import React, { useState, useEffect } from 'react';
import { apiService, TrainingSchedule } from '../services/api';
import TrainingScheduleForm from './TrainingScheduleForm';

const TrainingConfig: React.FC = () => {
    const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<TrainingSchedule | null>(null);

    // Generation Modal State
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedScheduleForGeneration, setSelectedScheduleForGeneration] = useState<TrainingSchedule | null>(null);
    const [generationMonth, setGenerationMonth] = useState(new Date().getMonth() + 1);
    const [generationYear, setGenerationYear] = useState(new Date().getFullYear());
    const [isGenerating, setIsGenerating] = useState(false);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAll<TrainingSchedule>('trainingschedules');
            setSchedules(data);
        } catch (error) {
            console.error('Error loading schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSchedules();
    }, []);

    const handleEdit = (schedule: TrainingSchedule) => {
        setEditingSchedule(schedule);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta configuración?')) return;
        try {
            await apiService.delete('trainingschedules', id);
            loadSchedules();
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    };

    const handleSave = () => {
        setShowForm(false);
        setEditingSchedule(null);
        loadSchedules();
    };

    const handleOpenGenerate = (schedule: TrainingSchedule) => {
        setSelectedScheduleForGeneration(schedule);
        setShowGenerateModal(true);
    };

    const handleGenerate = async () => {
        if (!selectedScheduleForGeneration) return;

        try {
            setIsGenerating(true);
            await apiService.post('trainingschedules/generate', {
                scheduleId: selectedScheduleForGeneration.id,
                month: generationMonth,
                year: generationYear
            });
            alert('Entrenamientos generados exitosamente.');
            setShowGenerateModal(false);
        } catch (error) {
            console.error('Error generating trainings:', error);
            alert('Error al generar los entrenamientos.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatDays = (daysStr: string) => {
        const daysMap: { [key: number]: string } = {
            1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom'
        };
        return daysStr.split(',').map(d => daysMap[parseInt(d)]).join(', ');
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '--';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const isPM = hour >= 12;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
    };

    if (showForm) {
        return (
            <TrainingScheduleForm
                schedule={editingSchedule}
                onCancel={() => { setShowForm(false); setEditingSchedule(null); }}
                onSave={handleSave}
            />
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="text-white h5 mb-1">Configuración Semanal</h3>
                    <p className="text-secondary small mb-0">Define patrones de entrenamiento recurrentes</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary d-flex align-items-center gap-2"
                    style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontSize: '14px' }}
                >
                    <i className="bi bi-plus-lg"></i> Nueva Configuración
                </button>
            </div>

            <div className="row g-4">
                {schedules.map(schedule => (
                    <div key={schedule.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h4 className="text-white fw-bold h6 mb-0">{schedule.nombre}</h4>
                                    <div className="dropdown">
                                        <button className="btn btn-link text-secondary p-0" type="button" data-bs-toggle="dropdown">
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-dark">
                                            <li><button className="dropdown-item" onClick={() => handleEdit(schedule)}>Editar</button></li>
                                            <li><button className="dropdown-item text-danger" onClick={() => handleDelete(schedule.id)}>Eliminar</button></li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-2 mb-4">
                                    <div className="d-flex align-items-center gap-2 text-secondary small">
                                        <i className="bi bi-tag"></i>
                                        <span>{schedule.categoria?.nombre || 'Sin categoría'}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-secondary small">
                                        <i className="bi bi-calendar-week"></i>
                                        <span className="text-white">{formatDays(schedule.diasSemana)}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-secondary small">
                                        <i className="bi bi-clock"></i>
                                        <span>{formatTime(schedule.horaInicio)} - {formatTime(schedule.horaFin)}</span>
                                    </div>
                                    {schedule.ubicacion && (
                                        <div className="d-flex align-items-center gap-2 text-secondary small">
                                            <i className="bi bi-geo-alt"></i>
                                            <span>{schedule.ubicacion}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleOpenGenerate(schedule)}
                                    className="btn btn-outline-primary w-100 btn-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    <i className="bi bi-lightning-charge"></i> Generar Mensualidad
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {schedules.length === 0 && !loading && (
                    <div className="col-12 text-center py-5">
                        <p className="text-secondary">No hay configuraciones creadas.</p>
                    </div>
                )}
            </div>

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-secondary border text-white" style={{ backgroundColor: '#161b22' }}>
                            <div className="modal-header border-bottom border-secondary border-opacity-25">
                                <h5 className="modal-title h6">Generar Entrenamientos</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGenerateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="small text-secondary mb-3">
                                    Se generarán entrenamientos para <strong>{selectedScheduleForGeneration?.nombre}</strong> en los días seleccionados.
                                </p>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <label className="form-label small text-secondary">Mes</label>
                                        <select
                                            className="form-select form-select-sm bg-dark text-white border-secondary border-opacity-25"
                                            value={generationMonth}
                                            onChange={e => setGenerationMonth(parseInt(e.target.value))}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-secondary">Año</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-25"
                                            value={generationYear}
                                            onChange={e => setGenerationYear(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-secondary border-opacity-25">
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowGenerateModal(false)}>Cancelar</button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? 'Generando...' : 'Generar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingConfig;
