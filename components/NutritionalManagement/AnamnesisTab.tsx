import React, { useState } from 'react';
import { Alumno, apiService } from '../../services/api';

interface AnamnesisTabProps {
    alumno: Alumno;
    onUpdate: () => void;
}

const AnamnesisTab: React.FC<AnamnesisTabProps> = ({ alumno, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        alergias: alumno.alergias || '',
        intolerancias: alumno.intolerancias || '',
        condicionesMedicas: alumno.condicionesMedicas || '',
        medicamentos: alumno.medicamentos || '',
        lesionesRecientes: alumno.lesionesRecientes || '',
        horasSueno: alumno.horasSueno || '',
        aguaDiaria: alumno.aguaDiaria || '',
        digestion: alumno.digestion || ''
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            if (alumno.id) {
                await apiService.updateAlumno(alumno.id, {
                    ...alumno,
                    ...formData,
                    horasSueno: formData.horasSueno ? Number(formData.horasSueno) : undefined,
                    id: alumno.id
                });
                onUpdate();
                setEditing(false);
            }
        } catch (error) {
            console.error('Error saving anamnesis:', error);
            alert('Error al guardar datos.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="d-flex flex-column gap-4 fade-in">
            <div className="d-flex justify-content-between align-items-center">
                <h4 className="text-white mb-0">Anamnesis & Antecedentes</h4>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="btn btn-sm btn-outline-primary"
                    >
                        <i className="bi bi-pencil me-2"></i> Editar Datos
                    </button>
                ) : (
                    <div className="btn-group btn-group-sm">
                        <button
                            onClick={() => setEditing(false)}
                            className="btn btn-outline-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>

            <div className="row g-4">

                {/* ALERTAS ROJAS */}
                <div className="col-md-6">
                    <div className="card h-100 bg-danger bg-opacity-10 border-danger border-opacity-25">
                        <div className="card-header bg-transparent border-danger border-opacity-25">
                            <h6 className="text-danger fw-bold text-uppercase mb-0 small">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                Alertas Importantes
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-secondary small fw-bold d-block mb-1 text-uppercase">Alergias Alimentarias</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={formData.alergias}
                                        onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                                        placeholder="Ej: Maní, Mariscos..."
                                    />
                                ) : (
                                    <div className={`d-inline-block px-2 py-1 rounded small ${formData.alergias ? 'bg-danger bg-opacity-25 text-white fw-bold' : 'text-muted fst-italic'}`}>
                                        {formData.alergias || 'Ninguna registrada'}
                                    </div>
                                )}
                            </div>

                            <div className="mb-0">
                                <label className="text-secondary small fw-bold d-block mb-1 text-uppercase">Intolerancias</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-white border-secondary"
                                        value={formData.intolerancias}
                                        onChange={e => setFormData({ ...formData, intolerancias: e.target.value })}
                                        placeholder="Ej: Lactosa, Gluten..."
                                    />
                                ) : (
                                    <div className={`d-inline-block px-2 py-1 rounded small ${formData.intolerancias ? 'bg-warning bg-opacity-25 text-white fw-bold' : 'text-muted fst-italic'}`}>
                                        {formData.intolerancias || 'Ninguna registrada'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ESTADO CLÍNICO */}
                <div className="col-md-6">
                    <div className="card h-100 bg-dark border-secondary">
                        <div className="card-header bg-transparent border-secondary">
                            <h6 className="text-info fw-bold text-uppercase mb-0 small">
                                <i className="bi bi-activity me-2"></i>
                                Estado Clínico
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Patologías / Enfermedades</label>
                                {editing ? (
                                    <textarea
                                        className="form-control bg-dark text-white border-secondary small"
                                        rows={2}
                                        value={formData.condicionesMedicas}
                                        onChange={e => setFormData({ ...formData, condicionesMedicas: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-white small mb-0">{formData.condicionesMedicas || '-'}</p>
                                )}
                            </div>

                            <div className="mb-3">
                                <label className="text-muted small d-block mb-1">Medicación Actual</label>
                                {editing ? (
                                    <textarea
                                        className="form-control bg-dark text-white border-secondary small"
                                        rows={2}
                                        value={formData.medicamentos}
                                        onChange={e => setFormData({ ...formData, medicamentos: e.target.value })}
                                        placeholder="Nombre, dosis, frecuencia..."
                                    />
                                ) : (
                                    <p className="text-white small mb-0">{formData.medicamentos || '-'}</p>
                                )}
                            </div>

                            <div className="mb-0">
                                <label className="text-muted small d-block mb-1">Lesiones Recientes</label>
                                {editing ? (
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-white border-secondary small"
                                        value={formData.lesionesRecientes}
                                        onChange={e => setFormData({ ...formData, lesionesRecientes: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-white small mb-0">{formData.lesionesRecientes || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HÁBITOS */}
                <div className="col-12">
                    <div className="card bg-dark border-secondary">
                        <div className="card-header bg-transparent border-secondary">
                            <h6 className="text-success fw-bold text-uppercase mb-0 small">
                                <i className="bi bi-calendar-check me-2"></i>
                                Hábitos Diarios
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <label className="text-muted small d-block mb-1">Horas de Sueño</label>
                                    {editing ? (
                                        <div className="input-group input-group-sm">
                                            <input
                                                type="number"
                                                step="0.5"
                                                className="form-control bg-dark text-white border-secondary"
                                                value={formData.horasSueno}
                                                onChange={e => setFormData({ ...formData, horasSueno: e.target.value })}
                                            />
                                            <span className="input-group-text bg-secondary border-secondary text-white">hrs</span>
                                        </div>
                                    ) : (
                                        <p className="text-white fw-bold mb-0">{formData.horasSueno ? `${formData.horasSueno} hrs` : '-'}</p>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="text-muted small d-block mb-1">Agua Diaria Estimada</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="form-control bg-dark text-white border-secondary small"
                                            value={formData.aguaDiaria}
                                            onChange={e => setFormData({ ...formData, aguaDiaria: e.target.value })}
                                            placeholder="Ej: 2 Litros"
                                        />
                                    ) : (
                                        <p className="text-white fw-bold mb-0">{formData.aguaDiaria || '-'}</p>
                                    )}
                                </div>

                                <div className="col-md-4">
                                    <label className="text-muted small d-block mb-1">Digestión</label>
                                    {editing ? (
                                        <select
                                            className="form-select bg-dark text-white border-secondary small"
                                            value={formData.digestion}
                                            onChange={e => setFormData({ ...formData, digestion: e.target.value })}
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="Normal">Normal</option>
                                            <option value="Estreñimiento">Estreñimiento</option>
                                            <option value="Diarrea">Diarrea</option>
                                            <option value="Irregular">Irregular</option>
                                        </select>
                                    ) : (
                                        <p className="text-white fw-bold mb-0">{formData.digestion || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnamnesisTab;
