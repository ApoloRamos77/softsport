
import React, { useState, useEffect } from 'react';
import ServiceForm from './ServiceForm';
import { db } from '../services/db';
import { Servicio } from '../services/api';

const ServiceManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const data = await db.getServicios();
      setServicios(data);
    } catch (error) {
      console.error('Error loading servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro que desea eliminar este servicio?')) return;
    
    try {
      await db.deleteServicio(id);
      await loadServicios();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(undefined);
  };

  const handleFormSave = async () => {
    await loadServicios();
    handleFormClose();
  };

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return <ServiceForm onCancel={handleFormClose} onSave={handleFormSave} serviceId={editingId} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Servicios</h2>
          <p className="text-sm text-slate-400 mt-1">Gestiona los servicios ofrecidos por tu academia</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <i className="fas fa-plus"></i> Nuevo Servicio
        </button>
      </div>

      <div className="relative max-w-sm">
        <input 
          type="text" 
          placeholder="Buscar servicios..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#0d1117] border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 pl-4 rounded-md text-white text-xs w-full outline-none transition-colors"
        />
      </div>

      <div className="bg-[#0d1117] border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="text-slate-400 uppercase bg-slate-900/20 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Servicio</th>
              <th className="px-4 py-3 font-semibold">Precio</th>
              <th className="px-4 py-3 font-semibold">Pronto Pago</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : filteredServicios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-600">
                    <i className="fas fa-briefcase text-4xl mb-2 opacity-30"></i>
                    <p>No se encontraron servicios</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredServicios.map((servicio) => (
                <tr key={servicio.id} className="border-b border-slate-800 hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{servicio.nombre}</div>
                    {servicio.descripcion && (
                      <div className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">
                        {servicio.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">${servicio.precio.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {servicio.prontoPago ? (
                      <span className="text-green-400 font-semibold">${servicio.prontoPago.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {servicio.recurrenteMensual ? (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-medium">
                        Recurrente
                      </span>
                    ) : (
                      <span className="bg-slate-700/50 text-slate-400 px-2 py-1 rounded text-[10px] font-medium">
                        Único
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(servicio.id!)}
                      className="text-blue-400 hover:text-blue-300 p-1.5 rounded hover:bg-blue-500/10 transition-colors mr-2"
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(servicio.id!)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceManagement;
