
import React, { useState, useEffect } from 'react';
import RepresentativeForm from './RepresentativeForm';
import { apiService, Representante, Alumno } from '../services/api';

const RepresentativeManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<Representante | null>(null);
  const [representatives, setRepresentatives] = useState<Representante[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRepresentatives = async () => {
    setLoading(true);
    try {
      const [repsData, alumnosData] = await Promise.all([
        apiService.getRepresentantes(),
        apiService.getAlumnos()
      ]);
      setRepresentatives(repsData);
      setAlumnos(alumnosData);
    } catch (error) {
      console.error('Error loading representatives:', error);
      alert('Error al cargar los representantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepresentatives();
  }, []);

  const handleSave = async (data: Representante) => {
    try {
      if (editingRepresentative?.id) {
        // Incluir el ID en los datos para la actualización
        const dataWithId = { ...data, id: editingRepresentative.id };
        await apiService.updateRepresentante(editingRepresentative.id, dataWithId);
      } else {
        await apiService.createRepresentante(data);
      }
      await loadRepresentatives();
      setShowForm(false);
      setEditingRepresentative(null);
    } catch (error) {
      console.error('Error saving representative:', error);
      alert('Error al guardar el representante');
    }
  };

  const handleEdit = (representative: Representante) => {
    setEditingRepresentative(representative);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro que desea anular este representante?')) {
      try {
        await apiService.deleteRepresentante(id);
        await loadRepresentatives();
        alert('Representante anulado exitosamente');
      } catch (error) {
        console.error('Error deleting representative:', error);
        alert('Error al anular el representante');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRepresentative(null);
  };

  const filteredData = representatives.filter(r => 
    !r.fechaAnulacion && // Excluir registros anulados
    (`${r.nombre} ${r.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.documento && r.documento.includes(searchTerm)))
  );

  if (showForm) {
    return (
      <RepresentativeForm 
        representative={editingRepresentative} 
        onCancel={handleCancelForm} 
        onSave={handleSave} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Representantes</h2>
          <p className="text-sm text-slate-400">Gestiona los representantes y sus alumnos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nuevo Representante
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email, teléfono o documento..." 
            className="form-input-dark p-2 pl-9 rounded-md border text-xs w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-slate-500 uppercase bg-slate-900/30 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4 font-semibold">Representante</th>
                <th className="px-5 py-4 font-semibold">Documento</th>
                <th className="px-5 py-4 font-semibold">Contacto</th>
                <th className="px-5 py-4 font-semibold">Parentesco</th>
                <th className="px-5 py-4 font-semibold text-center">Alumnos</th>
                <th className="px-5 py-4 font-semibold">Fecha Creación</th>
                <th className="px-5 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center text-slate-400">
                    <i className="fas fa-spinner fa-spin text-2xl"></i>
                    <p className="mt-3">Cargando representantes...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? filteredData.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{r.nombre} {r.apellido}</span>
                      <span className="text-slate-500">{r.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{r.documento}</td>
                  <td className="px-5 py-4 text-slate-300">{r.telefono}</td>
                  <td className="px-5 py-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">{r.parentesco}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">
                      {alumnos.filter(a => a.representanteId === r.id).length}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
                    {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                    {r.usuarioCreacion && <div className="text-slate-500 text-[10px]">por {r.usuarioCreacion}</div>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(r)} 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Editar representante"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id!)} 
                        classNa7e="text-red-400 hover:text-red-300 transition-colors"
                        title="Anular representante"
                      >
                        <i className="fas fa-ban"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center text-slate-500 italic">
                    No se encontraron representantes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeManagement;
