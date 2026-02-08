import React, { useState, useEffect } from 'react';
import { Alumno, Bioquimica, apiService } from '../../services/api';

interface BiochemistryTabProps {
    alumno: Alumno;
}

const BiochemistryTab: React.FC<BiochemistryTabProps> = ({ alumno }) => {
    const [history, setHistory] = useState<Bioquimica[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Bioquimica>>({
        fechaToma: new Date().toISOString().split('T')[0],
        hemoglobina: undefined,
        hematocrito: undefined,
        glucosaBasal: undefined,
        colesterolTotal: undefined,
        trigliceridos: undefined,
        vitaminaD: undefined,
        ferritina: undefined,
        observaciones: ''
    });

    const loadHistory = async () => {
        if (alumno.id) {
            setLoading(true);
            try {
                const data = await apiService.getBioquimicaByAlumno(alumno.id);
                setHistory(data);
            } catch (error) {
                console.error('Error loading biochemistry:', error);
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
            await apiService.createBioquimica({
                ...formData,
                alumnoId: alumno.id,
                fechaToma: new Date(formData.fechaToma!).toISOString()
            } as Bioquimica);
            setShowForm(false);
            loadHistory();
            setFormData({
                fechaToma: new Date().toISOString().split('T')[0],
                hemoglobina: undefined,
                hematocrito: undefined,
                glucosaBasal: undefined,
                colesterolTotal: undefined,
                trigliceridos: undefined,
                vitaminaD: undefined,
                ferritina: undefined,
                observaciones: ''
            });
        } catch (error) {
            console.error('Error saving biochemistry:', error);
            alert('Error al guardar analítica');
        }
    };

    return (
        <div className="d-flex flex-column gap-4 fade-in">
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-white mb-0">Analíticas de Sangre</h4>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`btn btn-sm ${showForm ? 'btn-outline-secondary' : 'btn-primary'}`}
                >
                    <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-2`}></i>
                    {showForm ? 'Cerrar' : 'Agregar Analítica'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-4 bg-dark border-secondary fade-in">
                    <div className="card-header bg-transparent border-secondary text-info border-opacity-25" style={{ color: '#a57cc4' }}>
                        <h6 className="fw-bold text-uppercase mb-0 small" style={{ color: '#a57cc4' }}>Registrar Resultados</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Fecha Toma</label>
                                <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.fechaToma} onChange={e => setFormData({ ...formData, fechaToma: e.target.value })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Hemoglobina</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.hemoglobina || ''} onChange={e => setFormData({ ...formData, hemoglobina: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Hematocrito</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.hematocrito || ''} onChange={e => setFormData({ ...formData, hematocrito: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Glucosa Basal</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.glucosaBasal || ''} onChange={e => setFormData({ ...formData, glucosaBasal: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Colesterol Total</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.colesterolTotal || ''} onChange={e => setFormData({ ...formData, colesterolTotal: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Triglicéridos</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.trigliceridos || ''} onChange={e => setFormData({ ...formData, trigliceridos: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Vitamina D</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.vitaminaD || ''} onChange={e => setFormData({ ...formData, vitaminaD: parseFloat(e.target.value) })} />
                            </div>

                            <div className="col-md-3">
                                <label className="text-secondary small d-block">Ferritina</label>
                                <input type="number" step="0.1" className="form-control form-control-sm bg-dark text-white border-secondary"
                                    value={formData.ferritina || ''} onChange={e => setFormData({ ...formData, ferritina: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <div className="card-footer bg-transparent text-end border-secondary border-opacity-25">
                        <button className="btn btn-sm btn-success" onClick={handleSave}>Guardar Analítica</button>
                    </div>
                </div>
            )}

            {/* Cards Display for Biochemistry */}
            <div className="row g-4">
                {history.map(b => (
                    <div key={b.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 bg-dark border-secondary">
                            <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center">
                                <span className="text-secondary small fw-bold text-uppercase">{new Date(b.fechaToma).toLocaleDateString()}</span>
                                <i className="bi bi-droplet-fill text-danger"></i>
                            </div>
                            <div className="card-body py-2">
                                <div className="d-flex flex-column gap-2 small">
                                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                                        <span className="text-secondary">Hemoglobina</span>
                                        <span className={`fw-medium ${b.hemoglobina && b.hemoglobina < 13 ? 'text-danger' : 'text-white'}`}>{b.hemoglobina || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                                        <span className="text-secondary">Glucosa</span>
                                        <span className="text-white fw-medium">{b.glucosaBasal || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                                        <span className="text-secondary">Colesterol</span>
                                        <span className="text-white fw-medium">{b.colesterolTotal || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-25 pb-1">
                                        <span className="text-secondary">Vitamina D</span>
                                        <span className="text-white fw-medium">{b.vitaminaD || '-'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary">Ferritina</span>
                                        <span className="text-white fw-medium">{b.ferritina || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="col-12 text-center py-5 text-secondary border border-dashed border-secondary rounded">
                        No hay registros de analíticas.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiochemistryTab;
