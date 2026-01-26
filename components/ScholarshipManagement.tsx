
import React, { useState, useEffect } from 'react';
import ScholarshipForm from './ScholarshipForm';

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
      const response = await fetch('http://localhost:5081/api/becas');
      const data = await response.json();
      setBecas(data);
    } catch (error) {
      console.error('Error cargando becas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (becaData: any) => {
    try {
      const url = editingBeca 
        ? `http://localhost:5081/api/becas/${editingBeca.id}` 
        : 'http://localhost:5081/api/becas';
      const method = editingBeca ? 'PUT' : 'POST';

      const dataToSend = editingBeca 
        ? { ...becaData, id: editingBeca.id }
        : becaData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Error al guardar el programa de becas');
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
      const response = await fetch(`http://localhost:5081/api/becas/${becaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el programa de becas');
      }

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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">Programas de Becas</h2>
          <p className="text-sm text-slate-400 mt-1">Administra los programas de becas de tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <i className="fas fa-plus"></i> Nuevo Programa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          Cargando...
        </div>
      ) : becas.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-white text-base">No hay programas de becas creados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {becas.map((beca) => (
            <div key={beca.id} className="bg-[#1a2332] border border-slate-700 rounded-lg p-5 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{beca.nombre}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(beca)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Editar"
                  >
                    <i className="fas fa-edit text-sm"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(beca.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </button>
                </div>
              </div>
              {beca.descripcion && (
                <p className="text-sm text-slate-400 mb-3">{beca.descripcion}</p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-400">{beca.porcentaje}%</span>
                <span className="text-sm text-slate-400">de descuento</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipManagement;
