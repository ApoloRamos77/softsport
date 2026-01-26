
import React, { useState, useRef, useEffect } from 'react';
import { apiService, TacticalBoard } from '../services/api';

interface TacticalBoardEditorProps {
  board: TacticalBoard | null;
  onBack: () => void;
}

const TacticalBoardEditor: React.FC<TacticalBoardEditorProps> = ({ board, onBack }) => {
  const [steps, setSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState(board?.nombre || '');
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial pitch draw
  useEffect(() => {
    if (board?.data) {
      try {
        const parsedData = JSON.parse(board.data);
        if (parsedData.steps) {
          setSteps(parsedData.steps);
        }
      } catch (e) {
        console.error('Error parsing board data:', e);
      }
    }
    // Ensure pitch is drawn after component mounts
    setTimeout(() => drawPitch(), 100);
  }, [board]);

  // Redraw pitch when canvas ref changes
  useEffect(() => {
    if (canvasRef.current) {
      drawPitch();
    }
  }, [canvasRef.current]);

  const drawPitch = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Field color
    ctx.fillStyle = '#10b981'; // Emerald 500
    ctx.fillRect(0, 0, width, height);

    // Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Outer boundary
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Center line
    ctx.beginPath();
    ctx.moveTo(width / 2, 10);
    ctx.lineTo(width / 2, height - 10);
    ctx.stroke();

    // Center circle
    const centerRadius = Math.min(width, height) * 0.08;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, centerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center point
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Areas (Proportional)
    const penaltyWidth = width * 0.08;
    const penaltyHeight = height * 0.35;
    const goalWidth = width * 0.035;
    const goalHeight = height * 0.17;
    
    // Left penalty area
    ctx.strokeRect(10, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    ctx.strokeRect(10, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    
    // Right penalty area
    ctx.strokeRect(width - 10 - penaltyWidth, height / 2 - penaltyHeight / 2, penaltyWidth, penaltyHeight);
    ctx.strokeRect(width - 10 - goalWidth, height / 2 - goalHeight / 2, goalWidth, goalHeight);
    
    // D-arc Left
    const dArcRadius = centerRadius * 0.75;
    ctx.beginPath();
    ctx.arc(10 + penaltyWidth, height / 2, dArcRadius, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    // D-arc Right
    ctx.beginPath();
    ctx.arc(width - 10 - penaltyWidth, height / 2, dArcRadius, Math.PI/2, -Math.PI/2);
    ctx.stroke();
  };

  const addStep = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setSteps([...steps, dataUrl]);
      setCurrentStep(steps.length);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Por favor ingresa un título para la jugada');
      return;
    }

    setSaving(true);
    try {
      const boardData: TacticalBoard = {
        nombre: title,
        data: JSON.stringify({
          steps,
          thumbnail: steps[0] || null
        })
      };

      if (board?.id) {
        await apiService.updateTacticalBoard(board.id, { ...boardData, id: board.id });
      } else {
        await apiService.createTacticalBoard(boardData);
      }
      
      onBack();
    } catch (error) {
      console.error('Error saving tactical board:', error);
      alert('Error al guardar la jugada');
    } finally {
      setSaving(false);
    }
  };

  const toolbarIcons = [
    { icon: 'fa-mouse-pointer', color: 'bg-blue-500' },
    { icon: 'fa-circle', color: 'bg-red-500' },
    { icon: 'fa-caret-up', color: 'bg-yellow-500' },
    { icon: 'fa-square', color: 'bg-white' },
    { icon: 'fa-location-arrow', color: 'bg-blue-400' },
    { separator: true },
    { icon: 'fa-minus' },
    { icon: 'fa-long-arrow-alt-up' },
    { icon: 'fa-font' },
    { icon: 'fa-square-o', type: 'outline' },
    { icon: 'fa-circle-o', type: 'outline' },
    { icon: 'fa-eraser' },
    { separator: true },
    { icon: 'fa-square', dark: true },
    { icon: 'fa-pencil-alt', label: '2px' },
    { separator: true },
    { icon: 'fa-undo' },
    { icon: 'fa-trash-alt' },
    { icon: 'fa-hand-pointer', color: 'text-red-500' }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#1a1f2e] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex justify-between items-center px-6 py-3 border-b border-slate-800/30">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Crear Jugada</h2>
            <p className="text-[10px] text-slate-500">Diseña tu jugada paso a paso</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
        >
          <i className="fas fa-save"></i> {saving ? 'Guardando...' : 'Guardar Jugada'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-3 space-y-3">
        {/* Title Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sin título"
            className="text-sm font-bold text-white bg-transparent border-0 focus:outline-none focus:ring-0 px-0 w-full"
          />
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 bg-[#0d1117] border border-slate-800/50 rounded-lg p-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {toolbarIcons.map((item, idx) => (
              item.separator ? (
                <div key={idx} className="w-px h-6 bg-slate-700/50 mx-1" />
              ) : (
                <button 
                  key={idx} 
                  className={`w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center transition-all ${
                    item.color 
                      ? `${item.color} text-white shadow-md` 
                      : item.dark
                      ? 'bg-[#1a1f2e] text-slate-400 hover:text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={item.label}
                >
                  {item.label && !item.icon ? (
                    <span className="text-[9px] font-bold">{item.label}</span>
                  ) : (
                    <i className={`fas ${item.icon} text-xs`}></i>
                  )}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-shrink-0">
          <canvas 
            ref={canvasRef} 
            width={560} 
            height={320} 
            className="cursor-crosshair rounded-lg border-4 border-slate-800/50 shadow-2xl"
            style={{ backgroundColor: '#10b981' }}
          />
        </div>
      </div>

      {/* Steps Section - Fixed at bottom */}
      <div className="flex-shrink-0 bg-[#0d1117]/30 border-t border-slate-800/30 px-6 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button 
                onClick={addStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
              >
                <i className="fas fa-plus"></i> Añadir Paso
              </button>
              <div className="flex items-center bg-[#0d1117] border border-slate-800/50 rounded-md overflow-hidden">
                <button 
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 border-r border-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 border-r border-slate-800/50 transition-all">
                  <i className="fas fa-play text-xs"></i>
                </button>
                <button 
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={currentStep >= steps.length}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
            <span className="text-xs text-slate-500">Paso {currentStep + 1} de {steps.length + 1}</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {steps.length === 0 ? (
              <div className="flex-shrink-0 w-32 h-20 rounded-lg border-2 border-dashed border-slate-700/50 flex items-center justify-center bg-[#0d1117]">
                <p className="text-[10px] text-slate-600 text-center px-3 leading-tight">
                  No hay pasos aún. Haz clic en "Añadir Paso" para comenzar la animación.
                </p>
              </div>
            ) : (
              steps.map((src, idx) => (
                <div 
                  key={idx} 
                  className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all ${
                    currentStep === idx 
                      ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' 
                      : 'ring-1 ring-slate-700/50 hover:ring-slate-600'
                  }`}
                  onClick={() => setCurrentStep(idx)}
                >
                  <img 
                    src={src} 
                    className="w-32 h-20 object-cover" 
                    alt={`Paso ${idx + 1}`} 
                  />
                  <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-bold">
                    {idx + 1}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalBoardEditor;
