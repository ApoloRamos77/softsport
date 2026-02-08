import React, { useState } from 'react';
import { Alumno, apiService } from '../../services/api';

interface ContextTabProps {
    alumno: Alumno;
    onUpdate: () => void;
}

const ContextTab: React.FC<ContextTabProps> = ({ alumno, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [horario, setHorario] = useState(alumno.horarioEntrenamiento || '');
    const [saving, setSaving] = useState(false);

    const calculateAge = (birthDateString?: string) => {
        if (!birthDateString) return 'N/A';
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (alumno.id) {
                await apiService.updateAlumno(alumno.id, {
                    ...alumno,
                    horarioEntrenamiento: horario,
                    id: alumno.id
                });
                onUpdate();
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving context:', error);
            alert('Error al guardar el horario.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="d-flex flex-column gap-4 fade-in">
            {/* Contexto Profesional */}
            <div className="card bg-dark border-secondary">
                <div className="card-header border-secondary bg-transparent">
                    <h5 className="mb-0 text-white">
                        <i className="bi bi-person-vcard me-2 text-primary"></i>
                        Contexto Profesional
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        {/* Datos del Alumno */}
                        <div className="col-md-6">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between p-3 rounded bg-dark border border-secondary">
                                    <span className="text-secondary small">Nombre Completo</span>
                                    <span className="text-white fw-medium">{alumno.nombre} {alumno.apellido}</span>
                                </div>

                                <div className="d-flex justify-content-between p-3 rounded bg-dark border border-secondary">
                                    <span className="text-secondary small">Edad</span>
                                    <span className="text-white fw-medium">{calculateAge(alumno.fechaNacimiento)} años</span>
                                </div>

                                <div className="d-flex justify-content-between p-3 rounded bg-dark border border-secondary">
                                    <span className="text-secondary small">Disciplina / Posición</span>
                                    <span className="text-white fw-medium">Fútbol / {alumno.posicion || 'No def.'}</span>
                                </div>

                                <div className="d-flex justify-content-between p-3 rounded bg-dark border border-secondary">
                                    <span className="text-secondary small">Categoría</span>
                                    <span className="text-white fw-medium">{alumno.categoria?.nombre || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Horario de Entrenamiento */}
                        <div className="col-md-6 d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="text-success small fw-bold text-uppercase">
                                    Horario de Entrenamiento
                                </label>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-sm btn-link text-decoration-none p-0"
                                    >
                                        <i className="bi bi-pencil me-1"></i> Editar
                                    </button>
                                ) : (
                                    <div className="btn-group btn-group-sm">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="btn btn-outline-secondary"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="btn btn-success"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={`flex-grow-1 p-3 rounded border ${isEditing ? 'border-primary bg-dark' : 'border-secondary bg-dark'}`}>
                                {isEditing ? (
                                    <textarea
                                        className="form-control bg-dark text-white border-0 h-100"
                                        style={{ resize: 'none', boxShadow: 'none' }}
                                        value={horario}
                                        onChange={(e) => setHorario(e.target.value)}
                                        placeholder="Ej: Lunes a Viernes, 8:00 AM - 10:00 AM"
                                    />
                                ) : (
                                    <p className="text-white mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                        {alumno.horarioEntrenamiento || <span className="text-muted fst-italic">No especificado.</span>}
                                    </p>
                                )}
                            </div>
                            <small className="text-muted mt-2 d-block">
                                <i className="bi bi-info-circle me-1"></i>
                                Vital para programar las comidas pre y post entreno.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Datos del Especialista */}
            <div className="card bg-dark border-secondary">
                <div className="card-header border-secondary bg-transparent">
                    <h5 className="mb-0 text-white">
                        <i className="bi bi-hospital me-2 text-danger"></i>
                        Datos del Especialista
                    </h5>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-3">Información para reportes oficiales.</p>

                    <div className="d-flex align-items-center gap-3 p-3 rounded bg-dark border border-secondary">
                        <div className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                            <i className="bi bi-person-lines-fill fs-4 text-secondary"></i>
                        </div>
                        <div>
                            <h6 className="text-white fw-bold mb-0">Dr. Nutrition Expert</h6>
                            <small className="text-info">CNP: 123456</small>
                        </div>
                        <div className="ms-auto text-muted small fst-italic">
                            (Configurable en perfil)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextTab;
