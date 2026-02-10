import React, { useState, useEffect } from 'react';
import { apiService, Personal } from '../services/api';

interface PersonalFormProps {
    personal?: Personal | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const PersonalForm: React.FC<PersonalFormProps> = ({ personal, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState<Personal>({
        nombres: '',
        apellidos: '',
        dni: '',
        celular: '',
        fechaNacimiento: '',
        cargo: 'Entrenador',
        estado: 'Activo'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (personal) {
            setFormData({
                ...personal,
                fechaNacimiento: personal.fechaNacimiento ? personal.fechaNacimiento.split('T')[0] : ''
            });
        }
    }, [personal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (personal?.id) {
                await apiService.updatePersonal(personal.id, formData);
            } else {
                await apiService.createPersonal(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving personal:', error);
            alert('Error al guardar el personal');
        } finally {
            setLoading(false);
        }
    };

    const cargos = ['Administrativo', 'Nutricionista', 'Terapeuta', 'Paramedico', 'Entrenador'];

    return (
        <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh', padding: '20px 0' }}>
            <div className="max-w-2xl mx-auto bg-[#161b22] rounded-xl shadow-2xl border border-secondary border-opacity-10 p-5">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white mb-1">
                        {personal ? 'Editar Personal' : 'Nuevo Personal'}
                    </h2>
                    <p className="text-[11px] text-secondary">Ingrese los datos del personal</p>
                </div>

                <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Nombres *</label>
                            <input
                                type="text"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.nombres}
                                onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Apellidos *</label>
                            <input
                                type="text"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.apellidos}
                                onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>DNI</label>
                            <input
                                type="text"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.dni || ''}
                                onChange={e => setFormData({ ...formData, dni: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Celular</label>
                            <input
                                type="text"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.celular || ''}
                                onChange={e => setFormData({ ...formData, celular: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Fecha de Nacimiento</label>
                            <input
                                type="date"
                                className="form-control border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.fechaNacimiento || ''}
                                onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="text-secondary small fw-bold mb-2 d-block text-uppercase" style={{ fontSize: '11px' }}>Cargo *</label>
                            <select
                                className="form-select border-secondary border-opacity-25 text-white bg-[#0d1117]"
                                value={formData.cargo || ''}
                                onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                                required
                            >
                                {cargos.map(c => (
                                    <option key={c} value={c} style={{ backgroundColor: '#0d1117' }}>{c}</option>
                                ))}
                            </select>
                        </div>
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
                            disabled={loading}
                            className="btn btn-sm btn-primary px-5 fw-bold"
                            style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalForm;
