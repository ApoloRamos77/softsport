import React, { useState, useEffect } from 'react';
import { Alumno, HistorialMedico, apiService } from '../../services/api';

interface NutritionalSummaryProps {
    alumno: Alumno;
}

const NutritionalSummary: React.FC<NutritionalSummaryProps> = ({ alumno }) => {
    const [current, setCurrent] = useState<HistorialMedico | null>(null);
    const [previous, setPrevious] = useState<HistorialMedico | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (alumno.id) {
                try {
                    const history = await apiService.getHistorialByAlumno(alumno.id);
                    // Sort desc
                    const sorted = history.sort((a, b) => new Date(b.fechaToma).getTime() - new Date(a.fechaToma).getTime());

                    if (sorted.length > 0) setCurrent(sorted[0]);
                    if (sorted.length > 1) setPrevious(sorted[1]);
                } catch (e) { console.error(e); }
            }
        };
        loadData();
    }, [alumno]);

    const renderChange = (curr?: number, prev?: number, inverse: boolean = false) => {
        if (curr === undefined || prev === undefined) return <span className="text-secondary">-</span>;
        const diff = curr - prev;
        if (diff === 0) return <span className="text-muted">=</span>;

        // For Fat (inverse): Negative diff is GOOD (Green), Positive diff is BAD (Red)
        // For Muscle !inverse: Positive diff is GOOD (Green), Negative diff is BAD (Red)
        const isGood = inverse ? diff < 0 : diff > 0;

        return (
            <span className={`small fw-bold ${isGood ? 'text-success' : 'text-danger'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                {isGood ? ' ▲' : ' ▼'}
            </span>
        );
    };

    return (
        <div className="d-flex flex-column h-100 p-2">
            <h6 className="text-secondary fw-bold text-uppercase small border-bottom border-dark pb-3 mb-3" style={{ letterSpacing: '2px' }}>
                Resumen de Progreso
            </h6>

            {!current ? (
                <p className="text-muted small fst-italic text-center mt-4">Sin mediciones registradas</p>
            ) : (
                <div className="d-flex flex-column gap-3">
                    <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-25">
                        <span className="text-muted small d-block mb-1">Peso Corporal</span>
                        <div className="d-flex justify-content-between align-items-end">
                            <span className="h4 fw-bold text-white mb-0">{current.peso} <small className="fs-6 fw-normal text-secondary">kg</small></span>
                            {renderChange(current.peso || 0, previous?.peso || 0, true)}
                        </div>
                    </div>

                    <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-25 position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 h-100 bg-warning" style={{ width: '4px' }}></div>
                        <span className="text-muted small d-block mb-1">% Grasa</span>
                        <div className="d-flex justify-content-between align-items-end">
                            <span className="h4 fw-bold text-white mb-0">{current.porcentajeGrasa || '-'} <small className="fs-6 fw-normal text-secondary">%</small></span>
                            {renderChange(current.porcentajeGrasa, previous?.porcentajeGrasa, true)}
                        </div>
                    </div>

                    <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-25 position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 h-100 bg-success" style={{ width: '4px' }}></div>
                        <span className="text-muted small d-block mb-1">% Músculo</span>
                        <div className="d-flex justify-content-between align-items-end">
                            <span className="h4 fw-bold text-white mb-0">{current.porcentajeMusculo || '-'} <small className="fs-6 fw-normal text-secondary">%</small></span>
                            {renderChange(current.porcentajeMusculo, previous?.porcentajeMusculo, false)}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                        <p className="text-muted mb-1 x-small" style={{ fontSize: '0.75rem' }}>Última Evaluación:</p>
                        <p className="text-white small fw-bold mb-0">
                            <i className="bi bi-calendar3 me-2 text-primary"></i>
                            {new Date(current.fechaToma).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NutritionalSummary;
