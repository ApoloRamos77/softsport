
import React from 'react';

interface DetalleReciboProps {
  recibo: any;
  onClose: () => void;
}

const DetalleRecibo: React.FC<DetalleReciboProps> = ({ recibo, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2332] border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Detalle del Recibo #{recibo.id}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Número de Recibo</p>
              <p className="text-white font-semibold">#{recibo.numero || recibo.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Fecha</p>
              <p className="text-white font-semibold">
                {new Date(recibo.fecha).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Alumno</p>
              <p className="text-white font-semibold">{recibo.alumnoNombre || recibo.AlumnoNombre || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Estado</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                recibo.estado === 'Pagado' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : recibo.estado === 'Pendiente'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {recibo.estado}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Items del Recibo</h3>
            <div className="bg-[#0f1729] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Cantidad</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Precio Unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recibo.items && recibo.items.length > 0 ? (
                    recibo.items.map((item: any, index: number) => (
                      <tr key={index} className="border-t border-slate-700">
                        <td className="px-4 py-3 text-white">{item.descripcion}</td>
                        <td className="px-4 py-3 text-right text-slate-300">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right text-slate-300">${item.precioUnitario?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">${item.total?.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        No hay items registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-slate-700 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="text-white font-semibold">${recibo.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Descuento:</span>
                <span className="text-yellow-400 font-semibold">-${recibo.descuento.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-white font-bold">Total:</span>
                <span className="text-green-400 font-bold">${recibo.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Abonos */}
          {recibo.abonos && recibo.abonos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Historial de Pagos</h3>
              <div className="bg-[#0f1729] rounded-lg p-4 space-y-2">
                {recibo.abonos.map((abono: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">${abono.monto.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(abono.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {abono.referencia && (
                      <span className="text-xs text-slate-400">Ref: {abono.referencia}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleRecibo;
