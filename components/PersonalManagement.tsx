import React, { useState, useEffect } from 'react';
import { apiService, Personal } from '../services/api';
import PersonalForm from './PersonalForm';

const PersonalManagement: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [personalList, setPersonalList] = useState<Personal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPersonal, setEditingPersonal] = useState<Personal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadPersonal = async () => {
        try {
            setLoading(true);
            // Fetch all personal, filter client-side if needed or use backend filtering if implemented
            const data = await apiService.getPersonal({});
            setPersonalList(data);
        } catch (error) {
            console.error('Error loading personal:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPersonal();
    }, []);

    const handleEdit = (personal: Personal) => {
        setEditingPersonal(personal);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este personal?')) return;
        try {
            await apiService.deletePersonal(id);
            loadPersonal();
        } catch (error) {
            console.error('Error deleting personal:', error);
            alert('Error al eliminar personal');
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        setEditingPersonal(null);
        loadPersonal();
    };

    const filteredList = personalList.filter(p =>
        (p.nombres + ' ' + p.apellidos).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return <PersonalForm personal={editingPersonal} onCancel={() => { setShowForm(false); setEditingPersonal(null); }} onSuccess={handleSuccess} />;
    }

    return (
        <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
            <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
                <div className="d-flex justify-content-between align-items-end mb-2">
                    <div>
                        <h2 className="mb-1 text-white fw-bold h4">Mantenimiento de Personal</h2>
                        <p className="text-secondary mb-0 small">Gestión de entrenadores, nutricionistas y personal administrativo</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary d-flex align-items-center gap-2 px-3"
                        style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
                    >
                        <i className="bi bi-plus-lg"></i> Nuevo Personal
                    </button>
                </div>

                <div className="card border-0 shadow-sm mb-4" style={{ backgroundColor: '#161b22' }}>
                    <div className="card-body">
                        <div className="position-relative">
                            <i className="bi bi-search position-absolute text-secondary" style={{ left: '0.8rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}></i>
                            <input
                                type="text"
                                placeholder="Buscar personal..."
                                className="form-control border-secondary border-opacity-25 text-white"
                                style={{ backgroundColor: '#0d1117', paddingLeft: '2.5rem' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="card border-0 shadow-sm" style={{ backgroundColor: '#0f1419' }}>
                    <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 py-3">
                        <h6 className="mb-0 fw-bold text-white">Lista de Personal</h6>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            {loading ? (
                                <div className="text-center py-5 text-secondary">Cargando...</div>
                            ) : filteredList.length === 0 ? (
                                <div className="text-center py-5 text-secondary">No hay personal registrado</div>
                            ) : (
                                <table className="table align-middle mb-0" style={{ borderColor: '#30363d' }}>
                                    <thead style={{ backgroundColor: '#161b22' }}>
                                        <tr>
                                            <th className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-25">Nombres</th>
                                            <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Cargo</th>
                                            <th className="py-3 text-white border-bottom border-secondary border-opacity-25">DNI</th>
                                            <th className="py-3 text-white border-bottom border-secondary border-opacity-25">Celular</th>
                                            <th className="pe-4 py-3 text-end text-white border-bottom border-secondary border-opacity-25">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredList.map((p) => (
                                            <tr key={p.id} className="hover-bg-dark-lighter">
                                                <td className="ps-4 py-3 text-white border-bottom border-secondary border-opacity-10 font-bold">
                                                    {p.nombres} {p.apellidos}
                                                </td>
                                                <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">
                                                    <span className="badge bg-dark text-white border border-secondary">
                                                        {(p.cargo || '').trim() || 'Sin Cargo'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{p.dni}</td>
                                                <td className="py-3 text-secondary border-bottom border-secondary border-opacity-10">{p.celular}</td>
                                                <td className="pe-4 py-3 text-end border-bottom border-secondary border-opacity-10">
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="btn btn-sm text-primary p-0 me-2"
                                                        title="Editar"
                                                        style={{ backgroundColor: 'transparent', border: 'none' }}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => p.id && handleDelete(p.id)}
                                                        className="btn btn-sm text-danger p-0"
                                                        title="Eliminar"
                                                        style={{ backgroundColor: 'transparent', border: 'none' }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalManagement;
