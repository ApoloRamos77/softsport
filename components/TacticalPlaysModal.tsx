
import React, { useState } from 'react';

interface TacticalPlaysModalProps {
  onClose: () => void;
  onConfirm: (count: number) => void;
}

const TacticalPlaysModal: React.FC<TacticalPlaysModalProps> = ({ onClose, onConfirm }) => {
  const [activeCategory, setActiveCategory] = useState('Todas las categorías');
  
  const categories = [
    'Todas las categorías', 'Ataque', 'Defensa', 'Jugada Preparada', 
    'Saque de Esquina', 'Tiro Libre', 'Contraataque', 
    'Ejercicio de Entrenamiento', 'Ejercicio Físico', 'Ejercicio Táctico', 'Otro'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white mb-1">Seleccionar Jugadas Tácticas</h2>
          <p className="text-sm text-slate-400">Selecciona las jugadas que se practicarán en este entrenamiento</p>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <i className="fas fa-layer-group text-4xl mb-4 opacity-20"></i>
            <p className="text-sm italic">No hay jugadas disponibles en esta categoría</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
          <span className="text-sm text-slate-400">0 jugadas seleccionadas</span>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm(0)}
              className="px-8 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold"
            >
              Confirmar Selección
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalPlaysModal;
