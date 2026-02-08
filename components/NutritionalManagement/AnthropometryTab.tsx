import React, { useState, useEffect } from 'react';
import { Alumno, HistorialMedico, apiService } from '../../services/api';

interface AnthropometryTabProps {
    alumno: Alumno;
}

const AnthropometryTab: React.FC<AnthropometryTabProps> = ({ alumno }) => {
    const [history, setHistory] = useState<HistorialMedico[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<HistorialMedico>>({
        fechaToma: new Date().toISOString().split('T')[0],
        peso: undefined,
        talla: undefined,
        porcentajeGrasa: undefined,
        porcentajeMusculo: undefined,
        grasaVisceral: undefined,
        cintura: undefined,
        cadera: undefined,
        brazoRelajado: undefined,
        muslo: undefined,
        observaciones: ''
    });

    const loadHistory = async () => {
        if (alumno.id) {
            setLoading(true);
            try {
                const data = await apiService.getHistorialByAlumno(alumno.id);
                // Sort by date ascending for chart
                setHistory(data.sort((a, b) => new Date(a.fechaToma).getTime() - new Date(b.fechaToma).getTime()));
            } catch (error) {
                console.error('Error loading history:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadHistory();
    }, [alumno]);

    const handleSave = async () => {
        if (!alumno.id) return;
        try {
            await apiService.createHistorial({
                ...formData,
                alumnoId: alumno.id,
                fechaToma: new Date(formData.fechaToma!).toISOString()
            } as HistorialMedico);
            setShowForm(false);
            loadHistory();
            setFormData({
                fechaToma: new Date().toISOString().split('T')[0],
                peso: undefined,
                talla: undefined,
                porcentajeGrasa: undefined,
                porcentajeMusculo: undefined,
                grasaVisceral: undefined,
                cintura: undefined,
                cadera: undefined,
                brazoRelajado: undefined,
                muslo: undefined,
                observaciones: ''
            });
        } catch (error) {
            console.error('Error saving anthropometry:', error);
            alert('Error al guardar medición');
        }
    };

    // Simple SVG Chart Component
    const renderChart = () => {
        if (history.length < 2) return <div className="text-secondary text-center py-5">Se necesitan al menos 2 registros para ver la evolución.</div>;

        const data = history;
        const width = 600;
        const height = 200;
        const padding = 20;

        // Get Min/Max for scaling
        // We want to show Muscle vs Fat
        const muscles = data.map(d => d.porcentajeMusculo || 0);
        const fats = data.map(d => d.porcentajeGrasa || 0);

        // Filter out entries where both are 0 or null to avoid weird chart
        const validDataPoints = data.map((d, i) => ({ d, i })).filter(item => (item.d.porcentajeMusculo || 0) > 0 || (item.d.porcentajeGrasa || 0) > 0);

        if (validDataPoints.length < 2) return <div className="text-secondary text-center py-5">Datos insuficientes de grasa/músculo para graficar.</div>;

        const allValues = [...muscles, ...fats].filter(v => v > 0);
        if (allValues.length === 0) return <div className="text-secondary text-center py-5">No hay datos de grasa/músculo.</div>;

        const minVal = Math.min(...allValues) * 0.9;
        const maxVal = Math.max(...allValues) * 1.1;

        const getX = (index: number) => padding + (index / (validDataPoints.length - 1)) * (width - 2 * padding);
        const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

        const lineMuscle = validDataPoints.map((p, i) => `${getX(i)},${getY(p.d.porcentajeMusculo || 0)}`).join(' ');
        const lineFat = validDataPoints.map((p, i) => `${getX(i)},${getY(p.d.porcentajeGrasa || 0)}`).join(' ');

        return (
            <svg width="100%" height="250" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {/* Grid lines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="1" />

                {/* Muscle Line (Green) */}
                <polyline points={lineMuscle} fill="none" stroke="#4ade80" strokeWidth="2" />
                {validDataPoints.map((p, i) => (
                    (p.d.porcentajeMusculo || 0) > 0 &&
                    <circle key={`m-${i}`} cx={getX(i)} cy={getY(p.d.porcentajeMusculo || 0)} r="4" fill="#4ade80">
                        <title>{`Músculo: ${p.d.porcentajeMusculo}% - ${new Date(p.d.fechaToma).toLocaleDateString()}`}</title>
                    </circle>
                ))}

                {/* Fat Line (Yellow) */}
                <polyline points={lineFat} fill="none" stroke="#fbbf24" strokeWidth="2" />
                {validDataPoints.map((p, i) => (
                    (p.d.porcentajeGrasa || 0) > 0 &&
                    <circle key={`f-${i}`} cx={getX(i)} cy={getY(p.d.porcentajeGrasa || 0)} r="4" fill="#fbbf24">
                        <title>{`Grasa: ${p.d.porcentajeGrasa}% - ${new Date(p.d.fechaToma).toLocaleDateString()}`}</title>
                    </circle>
                ))}

                {/* Legend */}
                <text x={width - 100} y={20} fill="#4ade80" fontSize="12" fontWeight="bold">● Músculo</text>
                <text x={width - 100} y={40} fill="#fbbf24" fontSize="12" fontWeight="bold">● Grasa</text>
            </svg>
        );
    };

    return (
        <div className="d-flex flex-column h-100 fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white m-0">Evolución Antropométrica</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`btn btn-sm ${showForm ? 'btn-outline-secondary' : 'btn-primary'}`}
                >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                    {showForm ? 'Cerrar Formulario' : 'Nueva Medición'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4 bg-primary bg-opacity-10 border-primary border-opacity-25 fade-in">
                    <div className="card-header bg-transparent border-primary border-opacity-25">
                        <h6 className="text-primary fw-bold text-uppercase mb-0 small">Registrar Medición</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Fecha</label>
                                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.fechaToma} onChange={e => setFormData({ ...formData, fechaToma: e.target.value })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Peso (kg)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.peso || ''} onChange={e => setFormData({ ...formData, peso: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Talla (m)</label>
                                <input type="number" step="0.01" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.talla || ''} onChange={e => setFormData({ ...formData, talla: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Grasa (%)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.porcentajeGrasa || ''} onChange={e => setFormData({ ...formData, porcentajeGrasa: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Músculo (%)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.porcentajeMusculo || ''} onChange={e => setFormData({ ...formData, porcentajeMusculo: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Grasa Visceral</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.grasaVisceral || ''} onChange={e => setFormData({ ...formData, grasaVisceral: parseFloat(e.target.value) })} />
                            </div>

                            {/* Perímetros */}
                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Cintura (cm)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.cintura || ''} onChange={e => setFormData({ ...formData, cintura: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Cadera (cm)</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.cadera || ''} onChange={e => setFormData({ ...formData, cadera: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <div className="card-footer bg-transparent border-primary border-opacity-25 text-end">
                        <button className="btn btn-sm btn-success" onClick={handleSave}>Guardar Registro</button>
                    </div>
                </div>
            )}

            {/* Chart Section */}
            <div className="card bg-dark border-secondary mb-4">
                <div className="card-header bg-transparent border-secondary">
                    <h6 className="text-secondary fw-bold text-uppercase mb-0 small">Composición Corporal</h6>
                </div>
                <div className="card-body">
                    {renderChart()}
                </div>
            </div>

            {/* History Table */}
            <div className="flex-grow-1 overflow-auto rounded border border-secondary bg-dark">
                <table className="table table-dark table-hover mb-0 small sticky-top">
                    <thead>
                        <tr>
                            <th className="text-secondary fw-medium">Fecha</th>
                            <th className="text-secondary fw-medium">Peso</th>
                            <th className="text-secondary fw-medium">IMC</th>
                            <th className="text-warning fw-medium">% Grasa</th>
                            <th className="text-success fw-medium">% Músculo</th>
                            <th className="text-secondary fw-medium">G. Visc.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...history].reverse().map((h) => (
                            <tr key={h.id}>
                                <td>{new Date(h.fechaToma).toLocaleDateString()}</td>
                                <td>{h.peso} kg</td>
                                <td>{h.imc}</td>
                                <td className="text-warning fw-bold">{h.porcentajeGrasa ? `${h.porcentajeGrasa}%` : '-'}</td>
                                <td className="text-success fw-bold">{h.porcentajeMusculo ? `${h.porcentajeMusculo}%` : '-'}</td>
                                <td>{h.grasaVisceral || '-'}</td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-secondary py-4">No hay registros</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnthropometryTab;
