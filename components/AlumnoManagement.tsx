
import React, { useState, useEffect } from 'react';
import AlumnoForm from './AlumnoForm';
import { Alumno, apiService } from '../services/api';

const AlumnoManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAlumnos = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAll<Alumno>('alumnos');
      // Filtrar alumnos anulados
      const activeAlumnos = data.filter(a => !a.fechaAnulacion);
      setAlumnos(activeAlumnos);
    } catch (error) {
      console.error('Error loading alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlumnos();
  }, []);

  const handleSave = async () => {
    await loadAlumnos();
    setShowForm(false);
    setEditingAlumno(null);
  };

  const handleEdit = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setShowForm(true);
  };

  const handleDelete = async (alumno: Alumno) => {
    if (!confirm(`¿Está seguro que desea anular al alumno "${alumno.nombre} ${alumno.apellido}"?`)) {
      return;
    }

    try {
      await apiService.delete('alumnos', alumno.id!);
      loadAlumnos();
    } catch (error) {
      console.error('Error al anular alumno:', error);
      alert('Error al anular el alumno');
    }
  };

  const filteredAlumnos = alumnos.filter(a => 
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <AlumnoForm 
        alumno={editingAlumno}
        onCancel={() => {
          setShowForm(false);
          setEditingAlumno(null);
        }} 
        onSave={handleSave} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Alumnos</h2>
          <p className="text-sm text-slate-400">Gestiona todos los alumnos de tu academia</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold hover:bg-slate-700 transition-colors">
            <i className="fas fa-file-pdf"></i> Exportar PDF
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-xs font-semibold transition-colors shadow-lg shadow-blue-500/20"
          >
            <i className="fas fa-plus"></i> Nuevo Alumno
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[300px] max-w-md">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o contacto..." 
            className="bg-[#0d1117] border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 p-2 pl-9 rounded-md border text-xs w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-800 rounded-md transition-colors">
            <i className="fas fa-filter text-slate-400"></i>
          </button>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Activos</option>
            <option>Inactivos</option>
            <option>Todos</option>
          </select>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todos los...</option>
            <option>Básico</option>
            <option>Intermedio</option>
            <option>Avanzado</option>
            <option>Elite</option>
          </select>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todas</option>
            <option>Sub-8</option>
            <option>Sub-10</option>
            <option>Sub-12</option>
            <option>Sub-15</option>
            <option>Sub-17</option>
            <option>Sub-20</option>
          </select>
          <select className="bg-[#0d1117] border-slate-700 text-white text-xs px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option>Todas</option>
            <option>Sin beca</option>
            <option>Beca parcial 25%</option>
            <option>Beca media</option>
            <option>Beca parcial 75%</option>
            <option>Beca completa</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Mostrando {filteredAlumnos.length} de {alumnos.length} alumnos
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="text-slate-500 uppercase bg-slate-900/30 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nro.</th>
                <th className="px-4 py-3">
                  Alumno <i className="fas fa-sort text-[10px] ml-1"></i>
                </th>
                <th className="px-4 py-3">Fecha Nac.</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Posición</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Categorías</th>
                <th className="px-4 py-3">Beca</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha Registro</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAlumnos.length > 0 ? filteredAlumnos.map((a, i) => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                   <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                   <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{a.nombre} {a.apellido}</span>
                        <span className="text-slate-500 text-[10px]">{a.documento || '-'}</span>
                      </div>
                   </td>
                   <td className="px-4 py-3 text-slate-300">
                     {a.fechaNacimiento ? new Date(a.fechaNacimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                   </td>
                   <td className="px-4 py-3 text-slate-300">{a.telefono || '-'}</td>
                   <td className="px-4 py-3 text-slate-300">{a.email || '-'}</td>
                   <td className="px-4 py-3 text-slate-300">{a.posicion || '-'}</td>
                   <td className="px-4 py-3 text-slate-300">{a.grupo?.nombre || '-'}</td>
                   <td className="px-4 py-3 text-slate-300">{a.categoria?.nombre || '-'}</td>
                   <td className="px-4 py-3">
                     <span className="bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">
                       {a.beca?.nombre || (a.beca?.porcentaje !== undefined ? a.beca.porcentaje + '%' : '-')}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                       a.estado === 'Activo' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-600/20 text-slate-400'
                     }`}>
                       {a.estado}
                     </span>
                   </td>
                   <td className="px-4 py-3 text-slate-500">
                     {a.fechaRegistro ? new Date(a.fechaRegistro).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                   </td>
                   <td className="px-4 py-3 text-right">
                     <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleEdit(a)}
                         className="text-blue-400 hover:text-blue-300 transition-colors"
                         title="Editar"
                       >
                         <i className="fas fa-edit"></i>
                       </button>
                       <button 
                         onClick={() => handleDelete(a)}
                         className="text-red-400 hover:text-red-300 transition-colors"
                         title="Anular"
                       >
                         <i className="fas fa-ban"></i>
                       </button>
                     </div>
                   </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={12} className="px-5 py-24 text-center">
                    <i className="fas fa-users text-4xl text-slate-700 mb-3"></i>
                    <p className="text-sm text-slate-500 font-medium">No se encontraron alumnos</p>
                    <p className="text-xs text-slate-600 mt-1">Intenta ajustar los filtros o agregar un nuevo alumno</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
        <button className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors" disabled>
          Anterior
        </button>
        <div className="text-xs text-slate-400">
          Página 1 de 1
        </div>
        <button className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors" disabled>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AlumnoManagement;
