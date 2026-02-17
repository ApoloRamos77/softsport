import React, { useState } from 'react';
import { Alumno } from '../../services/api';
import ContextTab from './ContextTab';
import AnamnesisTab from './AnamnesisTab';
import AnthropometryTab from './AnthropometryTab';
import BiochemistryTab from './BiochemistryTab';
import NutritionalPlanTab from './NutritionalPlanTab';
import ClinicalEvaluationTab from './ClinicalEvaluationTab';
import NutritionalSummary from './NutritionalSummary';

interface NutritionalManagerProps {
    alumno: Alumno;
    onClose: () => void;
    onUpdate: () => void; // Para recargar datos si algo cambia
}

type Tab = 'context' | 'anamnesis' | 'anthropometry' | 'biochemistry' | 'plan' | 'clinical';

const NutritionalManager: React.FC<NutritionalManagerProps> = ({ alumno, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<Tab>('context');

    return (
        <div className="d-flex flex-column h-100 bg-dark border border-secondary rounded overflow-hidden animate-fadeIn mb-4">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary bg-darker" style={{ backgroundColor: '#161b22' }}>
                <div className="d-flex align-items-center gap-3">
                    <button
                        onClick={onClose}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                        title="Volver al listado"
                    >
                        <i className="bi bi-arrow-left"></i>
                        <span>Volver</span>
                    </button>
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '40px', height: '40px' }}>
                        {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                    </div>
                    <div>
                        <h5 className="text-white m-0">{alumno.nombre} {alumno.apellido}</h5>
                        <small className="text-secondary">Gestión Nutricional Deportiva</small>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-bottom border-secondary bg-darker" style={{ backgroundColor: '#161b22' }}>
                <ul className="nav nav-tabs border-0 flex-nowrap" style={{ overflowX: 'auto' }}>
                    {[
                        { id: 'context', label: 'Contexto', icon: 'bi-person-badge' },
                        { id: 'clinical', label: 'Evaluación Clínica', icon: 'bi-heart-pulse' },
                        { id: 'anamnesis', label: 'Anamnesis', icon: 'bi-clipboard2-pulse' },
                        { id: 'anthropometry', label: 'Antropometría', icon: 'bi-rulers' },
                        { id: 'biochemistry', label: 'Bioquímica', icon: 'bi-moisture' },
                        { id: 'plan', label: 'Plan Nutricional', icon: 'bi-journal-medical' },
                    ].map((tab) => (
                        <li key={tab.id} className="nav-item">
                            <button
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`nav-link border-0 rounded-0 py-3 px-4 d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active bg-dark text-primary border-bottom border-primary border-2' : 'text-secondary hover-light'}`}
                                style={activeTab === tab.id ? { borderBottom: '2px solid var(--bs-primary)', backgroundColor: '#0d1117' } : { backgroundColor: 'transparent' }}
                            >
                                <i className={`bi ${tab.icon}`}></i>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Content Area */}
            <div className="flex-grow-1 overflow-auto p-4 bg-dark" style={{ minHeight: '600px', backgroundColor: '#0d1117' }}>
                <div className="row h-100 g-4">
                    {/* Main Content */}
                    <div className="col-lg-9 d-flex flex-column">
                        {activeTab === 'context' && <ContextTab alumno={alumno} onUpdate={onUpdate} />}
                        {activeTab === 'clinical' && <ClinicalEvaluationTab alumno={alumno} onUpdate={onUpdate} />}
                        {activeTab === 'anamnesis' && <AnamnesisTab alumno={alumno} onUpdate={onUpdate} />}
                        {activeTab === 'anthropometry' && <AnthropometryTab alumno={alumno} />}
                        {activeTab === 'biochemistry' && <BiochemistryTab alumno={alumno} />}
                        {activeTab === 'plan' && <NutritionalPlanTab alumno={alumno} />}
                    </div>

                    {/* Sidebar Summary Widget */}
                    <div className="col-lg-3 d-none d-lg-block border-start border-secondary">
                        <NutritionalSummary alumno={alumno} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default NutritionalManager;
