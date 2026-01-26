
import React, { useState, useEffect } from 'react';
import TrainingForm from './TrainingForm';
import { apiService } from '../services/api';

interface Categoria {
  id: number;
  nombre: string;
}

interface Training {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  ubicacion?: string;
  categoriaId?: number;
  categoria?: Categoria;
  tipo?: string;
  estado: string;
}

const TrainingManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAll<Training>('trainings');
      setTrainings(data);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const handleSave = async () => {
    await loadTrainings();
    setShowForm(false);
    setEditingTraining(null);
  };

  const handleEdit = (training: Training) => {
    setEditingTraining(training);
    setShowForm(true);
  };

  const handleDelete = async (training: Training) => {
    if (!confirm(`¿Está seguro de anular el entrenamiento "${training.titulo}"?`)) {
      return;
    }

    try {
      await apiService.delete('trainings', training.id);
      loadTrainings();
    } catch (error) {
      console.error('Error al anular entrenamiento:', error);
      alert('Error al anular el entrenamiento');
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (showForm) {
    return (
      <TrainingForm 
        training={editingTraining}
        onCancel={() => {
          setShowForm(false);
          setEditingTraining(null);
        }} 
        onSave={handleSave} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Entrenamientos</h2>
          <p className="text-sm text-slate-400">Gestión de sesiones de entrenamiento y asistencia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-plus"></i> Nuevo Entrenamiento
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Temporada:</span>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todas las...</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Categoría:</span>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todas las...</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Tipo:</span>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todos los tipos</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ordenar:</span>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Más reciente</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a2332] border border-slate-800 p-5 rounded-lg flex items-start justify-between hover:border-slate-700 transition-colors">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-2">Total Entrenamientos</p>
            <h3 className="text-3xl font-bold text-white">{trainings.length}</h3>
            <p className="text-[10px] text-slate-500 mt-2">Todas las categorías</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <i className="fas fa-dumbbell text-slate-400 text-lg"></i>
          </div>
        </div>
        <div className="bg-[#1a2332] border border-slate-800 p-5 rounded-lg flex items-start justify-between hover:border-slate-700 transition-colors">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-2">Próximos</p>
            <h3 className="text-3xl font-bold text-white">
              {trainings.filter(t => t.fecha && new Date(t.fecha) > new Date()).length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-2">Esta semana</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <i className="fas fa-calendar text-slate-400 text-lg"></i>
          </div>
        </div>
        <div className="bg-[#1a2332] border border-slate-800 p-5 rounded-lg flex items-start justify-between hover:border-slate-700 transition-colors">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-2">Asistencia Promedio</p>
            <h3 className="text-3xl font-bold text-white">0%</h3>
            <p className="text-[10px] text-slate-500 mt-2">Promedio general</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <i className="fas fa-check-circle text-slate-400 text-lg"></i>
          </div>
        </div>
        <div className="bg-[#1a2332] border border-slate-800 p-5 rounded-lg flex items-start justify-between hover:border-slate-700 transition-colors">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-2">Atletas Activos</p>
            <h3 className="text-3xl font-bold text-white">0</h3>
            <p className="text-[10px] text-slate-500 mt-2">En total</p>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            <i className="fas fa-users text-slate-400 text-lg"></i>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Listado de Entrenamientos</h3>
          <p className="text-[10px] text-slate-500">{trainings.length} entrenamientos encontrados</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-slate-500 uppercase bg-slate-900/30 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-clipboard-list text-4xl text-slate-700 mb-3"></i>
                      <p className="text-sm text-slate-500">No se encontraron registros de entrenamientos</p>
                    </div>
                  </td>
                </tr>
              ) : (
                trainings.map((training) => (
                  <tr key={training.id} className="border-b border-slate-800 hover:bg-slate-900/20 transition-colors">
                    <td className="px-4 py-3 text-white font-semibold">{formatDate(training.fecha)}</td>
                    <td className="px-4 py-3 text-white">{training.titulo}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatTime(training.horaInicio)} - {formatTime(training.horaFin)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{training.ubicacion || '--'}</td>
                    <td className="px-4 py-3 text-slate-400">{training.categoria?.nombre || '--'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        training.estado === 'Programado' ? 'bg-blue-500/20 text-blue-400' :
                        training.estado === 'Completado' ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {training.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(training)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(training)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Anular"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingManagement;
