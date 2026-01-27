import React, { useState, useEffect } from 'react';
import CategoryForm from './CategoryForm';
import { apiService } from '../services/api';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  edadMin?: number;
  edadMax?: number;
}

const CategoryManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Categoria>('categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (categoriaData: any) => {
    try {
      if (editingCategoria) {
        await apiService.update('categorias', editingCategoria.id, {
          ...categoriaData,
          id: editingCategoria.id
        });
      } else {
        await apiService.create('categorias', categoriaData);
      }

      await loadCategorias();
      setShowForm(false);
      setEditingCategoria(null);
    } catch (error: any) {
      alert(error.message || 'Error al guardar la categoría');
      console.error('Error:', error);
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleDelete = async (categoriaId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await apiService.delete('categorias', categoriaId);
      await loadCategorias();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar la categoría');
      console.error('Error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategoria(null);
  };

  if (showForm) {
    return (
      <CategoryForm
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialData={editingCategoria}
        isEditing={!!editingCategoria}
      />
    );
  }

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="d-flex justify-content-between align-items-end mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="mb-1 text-white fw-bold h4">Configuración de Categorías</h2>
          <p className="text-secondary mb-0 small">Define las categorías por rangos de edad y niveles</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary d-flex align-items-center gap-2 px-3"
            style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb', fontWeight: '600' }}
          >
            <i className="bi bi-plus-lg"></i> Nueva Categoría
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mb-0">Cargando categorías...</p>
        </div>
      ) : categorias.length === 0 ? (
        <div className="text-center py-5">
          <div className="d-flex flex-column align-items-center">
            <i className="bi bi-tags text-secondary display-4 mb-3"></i>
            <p className="text-muted fw-medium mb-0">No hay categorías creadas</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22', transition: 'transform 0.2s' }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title fw-bold mb-0 text-white">{categoria.nombre}</h5>
                    <div className="d-flex gap-1">
                      <button
                        onClick={() => handleEdit(categoria)}
                        className="btn btn-sm text-primary p-1"
                        title="Editar"
                        style={{ background: 'transparent', border: 'none' }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.id)}
                        className="btn btn-sm text-danger p-1"
                        title="Eliminar"
                        style={{ background: 'transparent', border: 'none' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  {categoria.descripcion ? (
                    <p className="card-text text-secondary small mb-3">{categoria.descripcion}</p>
                  ) : (
                    <p className="card-text text-muted small fst-italic mb-3">Sin descripción</p>
                  )}

                  {(categoria.edadMin || categoria.edadMax) && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge border border-secondary border-opacity-30 text-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <i className="bi bi-people-fill me-1"></i>
                        Edad: {categoria.edadMin || '?'} - {categoria.edadMax || '?'} años
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
