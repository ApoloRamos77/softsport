
import React, { useState, useEffect } from 'react';

interface Abono {
  id: number;
  reciboId: number;
  monto: number;
  fecha: string;
  paymentMethodId: number;
  referencia: string;
  recibo?: {
    id: number;
    alumno?: {
      nombre: string;
      apellido: string;
    };
    items?: Array<{
      nombre?: string;
      descripcion?: string;
    }>;
  };
}

interface PaymentMethod {
  id: number;
  nombre: string;
}

const AbonoManagement: React.FC = () => {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [filteredAbonos, setFilteredAbonos] = useState<Abono[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('todos');
  const [atletaFilter, setAtletaFilter] = useState('todos');
  const [metodoFilter, setMetodoFilter] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-01-22');

  useEffect(() => {
    loadAbonos();
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, estatusFilter, atletaFilter, metodoFilter, fechaDesde, fechaHasta, abonos]);

  const loadAbonos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5081/api/abonos');
      const data = await response.json();
      setAbonos(data);
    } catch (error) {
      console.error('Error cargando abonos:', error);
      alert('Error al cargar abonos');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('http://localhost:5081/api/paymentmethods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...abonos];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(abono => {
        const reciboId = abono.reciboId?.toString() || '';
        const alumno = `${abono.recibo?.alumno?.nombre || ''} ${abono.recibo?.alumno?.apellido || ''}`.toLowerCase();
        return reciboId.includes(searchTerm) || alumno.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro de método de pago
    if (metodoFilter !== 'todos') {
      filtered = filtered.filter(abono => abono.paymentMethodId === parseInt(metodoFilter));
    }

    // Filtro de fechas
    if (fechaDesde) {
      filtered = filtered.filter(abono => new Date(abono.fecha) >= new Date(fechaDesde));
    }
    if (fechaHasta) {
      filtered = filtered.filter(abono => new Date(abono.fecha) <= new Date(fechaHasta + 'T23:59:59'));
    }

    setFilteredAbonos(filtered);
  };

  const getPaymentMethodName = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.nombre || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <button className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold hover:bg-red-500/20 transition-all">
          <i className="fas fa-file-pdf"></i> Exportar PDF
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="Buscar por recibo o alumno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1a2332] border border-slate-700 text-white placeholder-slate-500 p-2 rounded-md text-sm w-full focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select 
          value={estatusFilter}
          onChange={(e) => setEstatusFilter(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white p-2 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="todos">Todos los estatus</option>
          <option value="completado">Completado</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <select 
          value={atletaFilter}
          onChange={(e) => setAtletaFilter(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white p-2 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="todos">Filtrar por atleta</option>
        </select>
        <select 
          value={metodoFilter}
          onChange={(e) => setMetodoFilter(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white p-2 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
        >
          <option value="todos">Todos los métodos</option>
          {paymentMethods.map(method => (
            <option key={method.id} value={method.id}>{method.nombre}</option>
          ))}
        </select>
        <input 
          type="date" 
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white p-2 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
        />
        <input 
          type="date" 
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="bg-[#1a2332] border border-slate-700 text-white p-2 rounded-md text-sm focus:outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 bg-slate-900/30 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">ID Recibo</th>
              <th className="px-4 py-3 font-semibold">Recibo</th>
              <th className="px-4 py-3 font-semibold">Alumno</th>
              <th className="px-4 py-3 font-semibold">Concepto</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Método de Pago</th>
              <th className="px-4 py-3 font-semibold text-center">Estatus</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : filteredAbonos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                  No se encontraron abonos
                </td>
              </tr>
            ) : (
              filteredAbonos.map((abono) => (
                <tr key={abono.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4 text-white font-medium">#{abono.reciboId}</td>
                  <td className="px-4 py-4 text-slate-300">Recibo #{abono.reciboId}</td>
                  <td className="px-4 py-4 text-slate-300">
                    {abono.recibo?.alumno 
                      ? `${abono.recibo.alumno.nombre} ${abono.recibo.alumno.apellido}`
                      : '-'}
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {abono.recibo?.items && abono.recibo.items.length > 0
                      ? abono.recibo.items.map(i => i.nombre || i.descripcion || '').join(', ')
                      : abono.referencia || '-'}
                  </td>
                  <td className="px-4 py-4 text-green-400 font-semibold">${abono.monto.toFixed(2)}</td>
                  <td className="px-4 py-4 text-slate-300">
                    {new Date(abono.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-4 text-slate-300">{getPaymentMethodName(abono.paymentMethodId)}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                      Completado
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
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
  );
};

export default AbonoManagement;
