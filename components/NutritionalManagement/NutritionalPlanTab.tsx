import React, { useState, useEffect } from 'react';
import { Alumno, PlanNutricional, Suplementacion, apiService } from '../../services/api';

interface NutritionalPlanTabProps {
    alumno: Alumno;
}

const NutritionalPlanTab: React.FC<NutritionalPlanTabProps> = ({ alumno }) => {
    const [plans, setPlans] = useState<PlanNutricional[]>([]);
    const [activePlan, setActivePlan] = useState<PlanNutricional | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<PlanNutricional>>({
        fechaInicio: new Date().toISOString().split('T')[0],
        objetivo: '',
        tmb: undefined,
        gastoEnergeticoTotal: undefined,
        proteinas: undefined,
        carbohidratos: undefined,
        grasas: undefined,
        suplementaciones: []
    });

    const loadPlans = async () => {
        if (alumno.id) {
            setLoading(true);
            try {
                const data = await apiService.getPlanesByAlumno(alumno.id);
                setPlans(data);
                if (data.length > 0) setActivePlan(data[0]);
            } catch (error) {
                console.error('Error loading plans:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadPlans();
    }, [alumno]);

    const handleEdit = (plan?: PlanNutricional) => {
        if (plan) {
            setFormData({
                ...plan,
                fechaInicio: plan.fechaInicio.split('T')[0],
                fechaFin: plan.fechaFin?.split('T')[0],
                suplementaciones: plan.suplementaciones ? [...plan.suplementaciones] : []
            });
            setActivePlan(plan);
        } else {
            // New Plan
            setFormData({
                fechaInicio: new Date().toISOString().split('T')[0],
                objetivo: 'Mantenimiento',
                suplementaciones: []
            });
            setActivePlan(null); // Clear active plan view while creating new
        }
        setEditing(true);
    };

    const handleSave = async () => {
        if (!alumno.id) return;
        try {
            const planData = {
                ...formData,
                alumnoId: alumno.id,
                fechaInicio: new Date(formData.fechaInicio!).toISOString(),
                fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString() : undefined,
            } as PlanNutricional;

            if (activePlan && activePlan.id) {
                await apiService.updatePlanNutricional(activePlan.id, planData);
            } else {
                await apiService.createPlanNutricional(planData);
            }

            setEditing(false);
            loadPlans();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error al guardar el plan nutricional');
        }
    };

    // Supplement Helpers
    const addSupplement = () => {
        const newSupp: Suplementacion = {
            planNutricionalId: 0,
            producto: '',
            dosis: '',
            momento: ''
        };
        setFormData({
            ...formData,
            suplementaciones: [...(formData.suplementaciones || []), newSupp]
        });
    };

    const updateSupplement = (index: number, field: keyof Suplementacion, value: string) => {
        const newSupps = [...(formData.suplementaciones || [])];
        newSupps[index] = { ...newSupps[index], [field]: value };
        setFormData({ ...formData, suplementaciones: newSupps });
    };

    const removeSupplement = (index: number) => {
        const newSupps = [...(formData.suplementaciones || [])];
        newSupps.splice(index, 1);
        setFormData({ ...formData, suplementaciones: newSupps });
    };

    return (
        <div className="d-flex flex-column h-100 fade-in">
            <div className="bg-dark p-3 rounded border border-secondary mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="text-white mb-0">Plan Nutricional</h5>
                    <small className="text-secondary">Define objetivos y estrategia.</small>
                </div>

                {!editing && (
                    <div className="d-flex gap-2">
                        <select
                            className="form-select form-select-sm bg-dark text-white border-secondary"
                            style={{ maxWidth: '250px' }}
                            onChange={(e) => setActivePlan(plans.find(p => p.id === parseInt(e.target.value)) || null)}
                            value={activePlan?.id || ''}
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{new Date(p.fechaInicio).toLocaleDateString()} - {p.objetivo}</option>
                            ))}
                            {plans.length === 0 && <option>Sin planes registrados</option>}
                        </select>
                        <button
                            onClick={() => handleEdit()}
                            className="btn btn-sm btn-primary text-nowrap"
                        >
                            <i className="bi bi-plus-lg me-2"></i> Nuevo Plan
                        </button>
                        {activePlan && (
                            <button
                                onClick={() => handleEdit(activePlan)}
                                className="btn btn-sm btn-outline-secondary"
                            >
                                <i className="bi bi-pencil"></i>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {editing ? (
                <div className="flex-grow-1 overflow-auto">
                    {/* Edit Form */}
                    <div className="row g-4 mb-4">
                        {/* General Info */}
                        <div className="col-lg-6">
                            <div className="card bg-dark border-secondary h-100">
                                <div className="card-header bg-transparent border-secondary bg-light bg-opacity-10 text-white">
                                    <h6 className="fw-bold text-uppercase mb-0 small text-info">Datos del Ciclo</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="text-secondary small d-block mb-1">Objetivo del Ciclo</label>
                                            <input type="text" className="form-control bg-dark text-white border-secondary"
                                                value={formData.objetivo || ''} onChange={e => setFormData({ ...formData, objetivo: e.target.value })} placeholder="Ej: Aumento de masa muscular" />
                                        </div>
                                        <div className="col-6">
                                            <label className="text-secondary small d-block mb-1">Fecha Inicio</label>
                                            <input type="date" className="form-control bg-dark text-white border-secondary"
                                                value={formData.fechaInicio} onChange={e => setFormData({ ...formData, fechaInicio: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="text-secondary small d-block mb-1">Fecha Fin (Opcional)</label>
                                            <input type="date" className="form-control bg-dark text-white border-secondary"
                                                value={formData.fechaFin || ''} onChange={e => setFormData({ ...formData, fechaFin: e.target.value })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="text-secondary small d-block mb-1">TMB (Kcal)</label>
                                            <input type="number" className="form-control bg-dark text-white border-secondary"
                                                value={formData.tmb || ''} onChange={e => setFormData({ ...formData, tmb: parseFloat(e.target.value) })} />
                                        </div>
                                        <div className="col-6">
                                            <label className="text-secondary small d-block mb-1">Gasto Total (Kcal)</label>
                                            <input type="number" className="form-control bg-dark text-white border-secondary"
                                                value={formData.gastoEnergeticoTotal || ''} onChange={e => setFormData({ ...formData, gastoEnergeticoTotal: parseFloat(e.target.value) })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Macros */}
                        <div className="col-lg-6">
                            <div className="card bg-dark border-secondary h-100">
                                <div className="card-header bg-transparent border-secondary bg-light bg-opacity-10 text-white">
                                    <h6 className="fw-bold text-uppercase mb-0 small text-success">Distribución de Macros (g/día)</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-4">
                                            <div className="text-center p-3 rounded border border-secondary bg-secondary bg-opacity-10">
                                                <label className="text-primary fw-bold d-block mb-2">Proteínas</label>
                                                <input type="number" className="form-control text-center bg-dark text-white border-0 fw-bold fs-5 px-0"
                                                    value={formData.proteinas || ''} onChange={e => setFormData({ ...formData, proteinas: parseInt(e.target.value) })} />
                                                <span className="small text-muted">g</span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-center p-3 rounded border border-secondary bg-secondary bg-opacity-10">
                                                <label className="text-warning fw-bold d-block mb-2">Carbos</label>
                                                <input type="number" className="form-control text-center bg-dark text-white border-0 fw-bold fs-5 px-0"
                                                    value={formData.carbohidratos || ''} onChange={e => setFormData({ ...formData, carbohidratos: parseInt(e.target.value) })} />
                                                <span className="small text-muted">g</span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="text-center p-3 rounded border border-secondary bg-secondary bg-opacity-10">
                                                <label className="text-warning text-opacity-75 fw-bold d-block mb-2">Grasas</label>
                                                <input type="number" className="form-control text-center bg-dark text-white border-0 fw-bold fs-5 px-0"
                                                    value={formData.grasas || ''} onChange={e => setFormData({ ...formData, grasas: parseInt(e.target.value) })} />
                                                <span className="small text-muted">g</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-3 rounded bg-secondary bg-opacity-25 text-center">
                                        <p className="text-muted mb-0 small">
                                            Total Calórico Aprox: <span className="text-white fw-bold ms-1 fs-6">
                                                {((formData.proteinas || 0) * 4 + (formData.carbohidratos || 0) * 4 + (formData.grasas || 0) * 9)} kcal
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supplements */}
                    <div className="card bg-dark border-secondary mb-4">
                        <div className="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-uppercase mb-0 small" style={{ color: '#a57cc4' }}>Suplementación Deportiva</h6>
                            <button onClick={addSupplement} className="btn btn-sm btn-outline-light text-purple-400 border-purple-500 hover:bg-purple-500 hover:text-white" style={{ borderColor: '#a57cc4', color: '#a57cc4' }}>
                                <i className="bi bi-plus-lg me-1"></i> Agregar Producto
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-2">
                                {(formData.suplementaciones || []).map((supp, idx) => (
                                    <div key={idx} className="d-flex gap-2 align-items-center bg-secondary bg-opacity-10 p-2 rounded">
                                        <input type="text" placeholder="Producto (Ej. Creatina)" className="form-control form-control-sm bg-dark text-white border-secondary flex-grow-1"
                                            value={supp.producto} onChange={e => updateSupplement(idx, 'producto', e.target.value)} />
                                        <input type="text" placeholder="Dosis" className="form-control form-control-sm bg-dark text-white border-secondary" style={{ width: '120px' }}
                                            value={supp.dosis || ''} onChange={e => updateSupplement(idx, 'dosis', e.target.value)} />
                                        <input type="text" placeholder="Momento" className="form-control form-control-sm bg-dark text-white border-secondary" style={{ width: '150px' }}
                                            value={supp.momento || ''} onChange={e => updateSupplement(idx, 'momento', e.target.value)} />
                                        <button onClick={() => removeSupplement(idx)} className="btn btn-link text-danger p-1">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                {(formData.suplementaciones || []).length === 0 && (
                                    <p className="text-muted small fst-italic text-center py-2 mb-0">No hay suplementos asignados.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pb-3">
                        <button onClick={() => setEditing(false)} className="btn btn-secondary">Cancelar</button>
                        <button onClick={handleSave} className="btn btn-primary">Guardar Plan Completo</button>
                    </div>
                </div>

            ) : activePlan ? (
                // View Mode
                <div className="flex-grow-1 overflow-auto">
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div className="card h-100 bg-secondary bg-opacity-10 border-secondary position-relative overflow-hidden">
                                <div className="position-absolute top-0 end-0 p-4 opacity-25" style={{ zIndex: 0 }}>
                                    <i className="bi bi-bullseye display-1 text-white"></i>
                                </div>
                                <div className="card-body position-relative" style={{ zIndex: 1 }}>
                                    <h3 className="text-white fw-bold mb-1">{activePlan.objetivo}</h3>
                                    <p className="text-muted small mb-4">
                                        {new Date(activePlan.fechaInicio).toLocaleDateString()}
                                        {activePlan.fechaFin ? ` - ${new Date(activePlan.fechaFin).toLocaleDateString()}` : ' (En curso)'}
                                    </p>

                                    <div className="row g-3 mb-4">
                                        <div className="col-6">
                                            <span className="text-secondary small fw-bold text-uppercase d-block">Gasto Energético</span>
                                            <p className="display-6 fw-bold text-white mb-0">{activePlan.gastoEnergeticoTotal || '-'} <small className="fs-6 fw-normal text-muted">kcal</small></p>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary small fw-bold text-uppercase d-block">Metabolismo Basal</span>
                                            <p className="h3 fw-bold text-light mb-0 mt-2">{activePlan.tmb || '-'} <small className="fs-6 fw-normal text-muted">kcal</small></p>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-3">
                                        <div>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-primary fw-bold">Proteínas</span>
                                                <span className="text-white">{activePlan.proteinas}g</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px', backgroundColor: '#333' }}>
                                                <div className="progress-bar bg-primary" role="progressbar" style={{ width: '40%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-warning fw-bold">Carbohidratos</span>
                                                <span className="text-white">{activePlan.carbohidratos}g</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px', backgroundColor: '#333' }}>
                                                <div className="progress-bar bg-warning" role="progressbar" style={{ width: '50%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="d-flex justify-content-between small mb-1">
                                                <span className="text-warning text-opacity-75 fw-bold" style={{ color: '#ffc107' }}>Grasas</span>
                                                <span className="text-white">{activePlan.grasas}g</span>
                                            </div>
                                            <div className="progress" style={{ height: '8px', backgroundColor: '#333' }}>
                                                <div className="progress-bar bg-warning bg-opacity-75" role="progressbar" style={{ width: '20%', backgroundColor: '#ffc107' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card h-100 bg-dark border-secondary">
                                <div className="card-header bg-transparent border-secondary">
                                    <h6 className="fw-bold text-uppercase mb-0 small" style={{ color: '#a57cc4' }}>
                                        <i className="bi bi-capsule me-2"></i>
                                        Suplementación
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex flex-column gap-3">
                                        {activePlan.suplementaciones && activePlan.suplementaciones.length > 0 ? (
                                            activePlan.suplementaciones.map((supp, i) => (
                                                <div key={i} className="d-flex align-items-start gap-3 p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                                                    <div className="rounded bg-purple bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0 text-white" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(111, 66, 193, 0.25)' }}>
                                                        <i className="bi bi-lightning-fill" style={{ color: '#a57cc4' }}></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-white fw-bold small mb-0">{supp.producto}</p>
                                                        <p className="text-muted x-small mb-0" style={{ fontSize: '0.75rem' }}>{supp.dosis} • {supp.momento}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted fst-italic text-center py-4 mb-0">Sin suplementación asignada.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
                    <i className="bi bi-journal-medical display-1 mb-3 opacity-25"></i>
                    <p>Selecciona un plan o crea uno nuevo para comenzar.</p>
                </div>
            )}
        </div>
    );
};

export default NutritionalPlanTab;
