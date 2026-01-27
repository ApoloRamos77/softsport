
import React, { useState, useEffect } from 'react';
import ScholarshipForm from './ScholarshipForm';
import { apiService } from '../services/api';

interface Beca {
  id: number;
  nombre: string;
  descripcion?: string;
  porcentaje: number;
}

const ScholarshipManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [becas, setBecas] = useState<Beca[]>([]);
  const [editingBeca, setEditingBeca] = useState<Beca | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBecas();
  }, []);

  const loadBecas = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Beca>('becas');
      setBecas(data);
    } catch (error) {
      console.error('Error cargando becas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (becaData: any) => {
    try {
      if (editingBeca) {
        await apiService.update('becas', editingBeca.id, {
          ...becaData,
          id: editingBeca.id
        });
      } else {
        await apiService.create('becas', becaData);
      }

      await loadBecas();
      setShowForm(false);
      setEditingBeca(null);
    } catch (error: any) {
      alert(error.message || 'Error al guardar el programa de becas');
      console.error('Error:', error);
    }
  };

  const handleEdit = (beca: Beca) => {
    setEditingBeca(beca);
    setShowForm(true);
  };

  const handleDelete = async (becaId: number) => {
    if (!confirm('¿Estás seguro de eliminar este programa de becas?')) return;

    try {
      await apiService.delete('becas', becaId);
      await loadBecas();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar el programa de becas');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBeca(null);
  };

  if (showForm) {
    return (
      <ScholarshipForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialData={editingBeca}
        isEditing={!!editingBeca}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Programas de Becas</h2>
            <p className="text-secondary mb-0 small">Administra los programas de becas de tu academia</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary d-flex align-items-center gap-2 px-3"
              style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
            >
              <i className="bi bi-plus-lg"></i> Nuevo Programa
            </button>
          </div>
        </div>

        {
          loading ? (
            <div className="text-center py-5 text-secondary">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="mb-0 small">Cargando becas...</p>
            </div>
          ) : becas.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted small">No hay programas de becas creados</p>
            </div>
          ) : (
            <div className="row g-4">
              {becas.map((beca) => (
                <div key={beca.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22', transition: 'transform 0.2s' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title fw-bold mb-0 text-white">{beca.nombre}</h5>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => handleEdit(beca)}
                            className="btn btn-sm text-primary p-1"
                            title="Editar"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(beca.id)}
                            className="btn btn-sm text-danger p-1"
                            title="Eliminar"
                            style={{ background: 'transparent', border: 'none' }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      {beca.descripcion && (
                        <p className="text-secondary small mb-3">{beca.descripcion}</p>
                      )}
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-primary fw-bold fs-3 font-monospace">{beca.porcentaje}%</span>
                        <span className="text-secondary small">de descuento</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default ScholarshipManagement;
