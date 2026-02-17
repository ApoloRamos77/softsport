import React, { useState, useEffect } from 'react';
import { Alumno, apiService } from '../../services/api';

interface ClinicalEvaluationTabProps {
    alumno: Alumno;
    onUpdate: () => void;
}

const ClinicalEvaluationTab: React.FC<ClinicalEvaluationTabProps> = ({ alumno, onUpdate }) => {
    const [formData, setFormData] = useState({
        tipoSangre: '',
        alergias: '',
        alergiaCustom: '',
        intolerancias: '',
        condicionesMedicas: '',
        lesionesRecientes: '',
        medicamentos: '',
        horasSueno: '',
        aguaDiaria: '',
        digestion: ''
    });

    const [saving, setSaving] = useState(false);

    // Load data from alumno
    useEffect(() => {
        if (alumno) {
            const predefinedAllergies = ['', 'Ninguna', 'Penicilina', 'Polen', 'Ácaros', 'Mariscos', 'Frutos secos', 'Látex', 'Picaduras de insectos'];
            const isCustomAllergy = alumno.alergias && !predefinedAllergies.includes(alumno.alergias);

            setFormData({
                tipoSangre: alumno.tipoSangre || '',
                alergias: isCustomAllergy ? 'Otro' : (alumno.alergias || ''),
                alergiaCustom: isCustomAllergy ? alumno.alergias : '',
                intolerancias: alumno.intolerancias || '',
                condicionesMedicas: alumno.condicionesMedicas || '',
                lesionesRecientes: alumno.lesionesRecientes || '',
                medicamentos: alumno.medicamentos || '',
                horasSueno: alumno.horasSueno?.toString() || '',
                aguaDiaria: alumno.aguaDiaria || '',
                digestion: alumno.digestion || ''
            });
        }
    }, [alumno]);

    const handleSave = async () => {
        if (!alumno.id) return;

        setSaving(true);
        try {
            await apiService.update('alumnos', alumno.id, {
                ...alumno,
                tipoSangre: formData.tipoSangre || null,
                alergias: formData.alergias === 'Otro' ? formData.alergiaCustom : formData.alergias || null,
                intolerancias: formData.intolerancias || null,
                condicionesMedicas: formData.condicionesMedicas || null,
                lesionesRecientes: formData.lesionesRecientes || null,
                medicamentos: formData.medicamentos || null,
                horasSueno: formData.horasSueno ? parseFloat(formData.horasSueno) : null,
                aguaDiaria: formData.aguaDiaria || null,
                digestion: formData.digestion || null
            });
            onUpdate();
            alert('Datos de evaluación clínica guardados correctamente');
        } catch (error) {
            console.error('Error saving clinical evaluation:', error);
            alert('Error al guardar los datos de evaluación clínica');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Evaluación Clínica y Hábitos */}
            <div className="p-4 rounded-lg border border-secondary border-opacity-10 bg-dark bg-opacity-30 mb-4">
                <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-4 d-block border-bottom border-green-900 border-opacity-30 pb-2">
                    Evaluación Clínica y Hábitos
                </label>

                <div className="row g-4">
                    {/* Row 1: Basic Bio */}
                    <div className="col-md-2">
                        <label className="small text-secondary">Tipo Sangre</label>
                        <select
                            className="form-select form-select-sm"
                            value={formData.tipoSangre}
                            onChange={e => setFormData({ ...formData, tipoSangre: e.target.value })}
                        >
                            <option value="">--</option>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="col-md-5">
                        <label className="small text-secondary">Alergias</label>
                        <select
                            className="form-select form-select-sm"
                            value={formData.alergias}
                            onChange={e => setFormData({ ...formData, alergias: e.target.value })}
                        >
                            <option value="">Ninguna</option>
                            <option value="Ninguna">Ninguna</option>
                            <option value="Penicilina">Penicilina</option>
                            <option value="Polen">Polen</option>
                            <option value="Ácaros">Ácaros</option>
                            <option value="Mariscos">Mariscos</option>
                            <option value="Frutos secos">Frutos secos</option>
                            <option value="Látex">Látex</option>
                            <option value="Picaduras de insectos">Picaduras de insectos</option>
                            <option value="Otro">Otro (Especifique)</option>
                        </select>
                        {formData.alergias === 'Otro' && (
                            <input
                                type="text"
                                placeholder="Especifique..."
                                className="form-control form-control-sm mt-1"
                                value={formData.alergiaCustom}
                                onChange={e => setFormData({ ...formData, alergiaCustom: e.target.value })}
                            />
                        )}
                    </div>
                    <div className="col-md-5">
                        <label className="small text-secondary">Intolerancias Alimentarias</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Ej. Lactosa, Gluten..."
                            value={formData.intolerancias}
                            onChange={e => setFormData({ ...formData, intolerancias: e.target.value })}
                        />
                    </div>

                    {/* Row 2: Conditions & Injuries */}
                    <div className="col-md-6">
                        <label className="small text-secondary">Condiciones Médicas</label>
                        <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Asma, Diabetes, etc..."
                            value={formData.condicionesMedicas}
                            onChange={e => setFormData({ ...formData, condicionesMedicas: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="small text-secondary">Lesiones Recientes</label>
                        <textarea
                            className="form-control form-control-sm"
                            rows={2}
                            placeholder="Esguinces, fracturas (últimos 6 meses)..."
                            value={formData.lesionesRecientes}
                            onChange={e => setFormData({ ...formData, lesionesRecientes: e.target.value })}
                        />
                    </div>

                    {/* Row 3: Meds */}
                    <div className="col-12">
                        <label className="small text-secondary">Medicamentos Regulares</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Nombre, dosis y frecuencia..."
                            value={formData.medicamentos}
                            onChange={e => setFormData({ ...formData, medicamentos: e.target.value })}
                        />
                    </div>

                    {/* Row 4: Habits */}
                    <div className="col-md-4">
                        <label className="small text-secondary">Sueño (Horas/Día)</label>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="8"
                            value={formData.horasSueno}
                            onChange={e => setFormData({ ...formData, horasSueno: e.target.value })}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="small text-secondary">Consumo de Agua</label>
                        <select
                            className="form-select form-select-sm"
                            value={formData.aguaDiaria}
                            onChange={e => setFormData({ ...formData, aguaDiaria: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            <option value="Menos de 1L">Menos de 1L</option>
                            <option value="1L - 2L">1L - 2L</option>
                            <option value="Más de 2L">Más de 2L</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="small text-secondary">Digestión</label>
                        <select
                            className="form-select form-select-sm"
                            value={formData.digestion}
                            onChange={e => setFormData({ ...formData, digestion: e.target.value })}
                        >
                            <option value="">Seleccionar</option>
                            <option value="Regular">Regular (Normal)</option>
                            <option value="Lenta">Lenta (Estreñimiento)</option>
                            <option value="Acelerada">Acelerada</option>
                            <option value="Irregular">Irregular</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="d-flex justify-content-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-success d-flex align-items-center gap-2"
                >
                    <i className="bi bi-save"></i>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
};

export default ClinicalEvaluationTab;
