
import React, { useState, useEffect } from 'react';
import CategoryForm from './CategoryForm';

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
      const response = await fetch('http://localhost:5081/api/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (categoriaData: any) => {
    try {
      const url = editingCategoria 
        ? `http://localhost:5081/api/categorias/${editingCategoria.id}` 
        : 'http://localhost:5081/api/categorias';
      const method = editingCategoria ? 'PUT' : 'POST';

      // Si estamos editando, incluir el ID en el cuerpo
      const dataToSend = editingCategoria 
        ? { ...categoriaData, id: editingCategoria.id }
        : categoriaData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al guardar la categoría');
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
      const response = await fetch(`http://localhost:5081/api/categorias/${categoriaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la categoría');
      }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Categorías</h2>
          <p className="text-sm text-slate-400">Administra las categorías de tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <i className="fas fa-plus"></i> Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">
          Cargando...
        </div>
      ) : categorias.length === 0 ? (
        <div className="py-10 text-slate-400 italic">
          No hay categorías creadas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div 
              key={categoria.id} 
              className="bg-[#111827] border border-slate-800 rounded-lg p-5 hover:border-blue-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{categoria.nombre}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
              {categoria.descripcion && (
                <p className="text-sm text-slate-400 mb-3">{categoria.descripcion}</p>
              )}
              {(categoria.edadMin || categoria.edadMax) && (
                <div className="text-xs text-slate-500">
                  Edad: {categoria.edadMin || '?'} - {categoria.edadMax || '?'} años
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
