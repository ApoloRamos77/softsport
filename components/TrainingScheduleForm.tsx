
import React, { useState, useEffect } from 'react';
import { apiService, Categoria, TrainingSchedule, Personal } from '../services/api';

interface TrainingScheduleFormProps {
    schedule?: TrainingSchedule | null;
    onCancel: () => void;
    onSave: () => void;
}

const TrainingScheduleForm: React.FC<TrainingScheduleFormProps> = ({ schedule, onCancel, onSave }) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [entrenadores, setEntrenadores] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        categoriaIds: [] as number[],
        entrenadorId: '',
        diasSemana: [] as number[], // 1=Mon, 7=Sun
        horaInicio: { hora: '--', minuto: '--', periodo: 'AM' },
        horaFin: { hora: '--', minuto: '--', periodo: 'AM' },
        ubicacion: '',
        descripcion: ''
    });

    const daysOptions = [
        { id: 1, label: 'Lunes' },
        { id: 2, label: 'Martes' },
        { id: 3, label: 'Miércoles' },
        { id: 4, label: 'Jueves' },
        { id: 5, label: 'Viernes' },
        { id: 6, label: 'Sábado' },
        { id: 7, label: 'Domingo' }
    ];

    // Load categories and coaches
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [cats, coaches] = await Promise.all([
                    apiService.getAll<Categoria>('categorias'),
                    apiService.getPersonal({ cargo: 'Entrenador' })
                ]);
                setCategorias(cats);
                setEntrenadores(coaches);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Load schedule data if editing
    useEffect(() => {
        if (schedule) {
            const parseTime = (timeStr?: string) => {
                if (!timeStr) return { hora: '--', minuto: '--', periodo: 'AM' };
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const isPM = hour >= 12;
                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                return {
                    hora: displayHour.toString().padStart(2, '0'),
                    minuto: minutes || '00',
                    periodo: isPM ? 'PM' : 'AM'
                };
            };

            setFormData({
                nombre: schedule.nombre || '',
                categoriaIds: schedule.categoriaId ? [schedule.categoriaId] : [],
                entrenadorId: schedule.entrenadorId?.toString() || '',
                diasSemana: schedule.diasSemana ? schedule.diasSemana.split(',').map(Number) : [],
                horaInicio: parseTime(schedule.horaInicio),
                horaFin: parseTime(schedule.horaFin),
                ubicacion: schedule.ubicacion || '',
                descripcion: schedule.descripcion || ''
            });
        }
    }, [schedule]);

    // Toggle category selection
    const toggleCategory = (catId: number) => {
        setFormData(prev => ({
            ...prev,
            categoriaIds: prev.categoriaIds.includes(catId)
                ? prev.categoriaIds.filter(id => id !== catId)
                : [...prev.categoriaIds, catId]
        }));
    };

    const toggleDay = (dayId: number) => {
        setFormData(prev => {
            const days = prev.diasSemana.includes(dayId)
                ? prev.diasSemana.filter(d => d !== dayId)
                : [...prev.diasSemana, dayId];
            return { ...prev, diasSemana: days.sort((a, b) => a - b) };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.diasSemana.length === 0) {
            alert('Debes seleccionar al menos un día de la semana');
            return;
        }

        const formatTime = (time: { hora: string; minuto: string; periodo: string }) => {
            if (time.hora === '--' || time.minuto === '--') return undefined;
            let hour = parseInt(time.hora);
            if (time.periodo === 'PM' && hour !== 12) hour += 12;
            if (time.periodo === 'AM' && hour === 12) hour = 0;
            return `${hour.toString().padStart(2, '0')}:${time.minuto}:00`;
        };

        const scheduleData = {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            categoriaId: formData.categoriaIds.length > 0 ? formData.categoriaIds[0] : null,
            entrenadorId: formData.entrenadorId ? parseInt(formData.entrenadorId) : null,
            diasSemana: formData.diasSemana.join(','),
            horaInicio: formatTime(formData.horaInicio),
            horaFin: formatTime(formData.horaFin),
            ubicacion: formData.ubicacion || null,
            estado: 'Activo'
        };

        try {
            if (schedule?.id) {
                await apiService.update('trainingschedules', schedule.id, { ...scheduleData, id: schedule.id });
            } else {
                await apiService.create('trainingschedules', scheduleData);
            }
            onSave();
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            alert('Error al guardar la configuración');
        }
    };

    return (
        <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh', padding: '20px 0' }}>
            <div className="max-w-3xl mx-auto bg-[#161b22] rounded-xl shadow-2xl border border-secondary border-opacity-10 p-5">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {schedule ? 'Editar Configuración Semanal' : 'Nueva Configuración Semanal'}
                    </h2>
                    <p className="text-[11px] text-secondary">Define los días y horarios para generar entrenamientos automáticamente</p>
                </div>

                <form onSubmit={handleSave} className="d-flex flex-column gap-4">

                    <div className="form-group mb-0">
                        <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Nombre de la Configuración *</label>
                        <input
                            type="text"
                            placeholder="Ej: Sub-15 Mañana"
                            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Categorías * (selección múltiple)</label>
                            <div className="border border-secondary border-opacity-25 rounded p-3 bg-[#0d1117]" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {categorias.length === 0 ? (
                                    <p className="text-secondary text-sm mb-0">Cargando categorías...</p>
                                ) : (
                                    categorias.map(cat => (
                                        <div key={cat.id} className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`schedule-cat-${cat.id}`}
                                                checked={formData.categoriaIds.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                            />
                                            <label className="form-check-label text-white" htmlFor={`schedule-cat-${cat.id}`}>
                                                {cat.nombre}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                            {formData.categoriaIds.length === 0 && (
                                <small className="text-danger d-block mt-1">Selecciona al menos una categoría</small>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Entrenador</label>
                            <select
                                className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.entrenadorId}
                                onChange={e => setFormData({ ...formData, entrenadorId: e.target.value })}
                            >
                                <option value="" style={{ backgroundColor: '#0d1117' }}>Seleccionar entrenador</option>
                                {entrenadores.map(coach => (
                                    <option key={coach.id} value={coach.id} style={{ backgroundColor: '#0d1117' }}>
                                        {coach.nombres} {coach.apellidos}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Días de la Semana *</label>
                        <div className="d-flex flex-wrap gap-2">
                            {daysOptions.map(day => (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleDay(day.id)}
                                    className={`btn btn-sm ${formData.diasSemana.includes(day.id)
                                        ? 'btn-primary bg-primary text-white border-primary'
                                        : 'btn-outline-secondary text-secondary border-secondary border-opacity-25'
                                        }`}
                                    style={{ minWidth: '80px' }}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Hora de Inicio</label>
                            <div className="d-flex gap-2">
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2" value={formData.horaInicio.hora} onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, hora: e.target.value } })}>
                                    <option value="--">--</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="text-secondary align-self-center">:</span>
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2" value={formData.horaInicio.minuto} onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, minuto: e.target.value } })}>
                                    <option value="--">--</option>
                                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2 w-auto" value={formData.horaInicio.periodo} onChange={e => setFormData({ ...formData, horaInicio: { ...formData.horaInicio, periodo: e.target.value } })}>
                                    <option>AM</option>
                                    <option>PM</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Hora de Fin</label>
                            <div className="d-flex gap-2">
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2" value={formData.horaFin.hora} onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, hora: e.target.value } })}>
                                    <option value="--">--</option>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => <option key={h} value={h.toString().padStart(2, '0')}>{h.toString().padStart(2, '0')}</option>)}
                                </select>
                                <span className="text-secondary align-self-center">:</span>
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2" value={formData.horaFin.minuto} onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, minuto: e.target.value } })}>
                                    <option value="--">--</option>
                                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117] p-2 w-auto" value={formData.horaFin.periodo} onChange={e => setFormData({ ...formData, horaFin: { ...formData.horaFin, periodo: e.target.value } })}>
                                    <option>AM</option>
                                    <option>PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Ubicación</label>
                        <div className="position-relative">
                            <i className="bi bi-geo-alt position-absolute text-secondary" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}></i>
                            <input
                                type="text"
                                placeholder="Nombre del lugar o campo"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.ubicacion}
                                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Descripción</label>
                        <textarea
                            className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117] min-h-[80px]"
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-4 border-top border-secondary border-opacity-25">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-sm px-4 text-secondary hover-text-white border-0 bg-transparent"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary px-5 fw-bold"
                            style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                        >
                            {schedule ? 'Guardar Cambios' : 'Crear Configuración'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TrainingScheduleForm;
