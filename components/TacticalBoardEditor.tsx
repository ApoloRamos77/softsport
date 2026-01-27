
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
    ctx.arc(10 + penaltyWidth, height / 2, dArcRadius, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // D-arc Right
    ctx.beginPath();
    ctx.arc(width - 10 - penaltyWidth, height / 2, dArcRadius, Math.PI / 2, -Math.PI / 2);
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
    { icon: 'bi-cursor-fill', color: 'btn-primary' },
    { icon: 'bi-circle-fill', color: 'btn-danger' },
    { icon: 'bi-caret-up-fill', color: 'btn-warning' },
    { icon: 'bi-square-fill', color: 'btn-light' },
    { icon: 'bi-geo-alt-fill', color: 'btn-info' },
    { separator: true },
    { icon: 'bi-dash-lg' },
    { icon: 'bi-arrow-up' },
    { icon: 'bi-type' },
    { icon: 'bi-square' },
    { icon: 'bi-circle' },
    { icon: 'bi-eraser-fill' },
    { separator: true },
    { icon: 'bi-square-fill', dark: true },
    { icon: 'bi-pencil', label: '2px' },
    { separator: true },
    { icon: 'bi-arrow-counterclockwise' },
    { icon: 'bi-trash' },
    { icon: 'bi-hand-index', color: 'text-danger' }
  ];

  return (
    <div className="d-flex flex-column h-100 overflow-hidden" style={{ backgroundColor: '#161b22', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex-shrink-0 d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-secondary border-opacity-25" style={{ backgroundColor: '#0d1117' }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={onBack} className="btn btn-link text-secondary p-0 hover-text-white">
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <div>
            <h2 className="h5 font-bold text-white mb-0">Crear Jugada</h2>
            <p className="small text-secondary mb-0" style={{ fontSize: '11px' }}>Diseña tu jugada paso a paso</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary d-flex align-items-center gap-2 btn-sm fw-bold"
          style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
        >
          <i className="bi bi-save"></i> {saving ? 'Guardando...' : 'Guardar Jugada'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 d-flex flex-column overflow-hidden px-4 py-3 gap-3">
        {/* Title Input */}
        <div className="flex-shrink-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sin título"
            className="form-control-plaintext text-white fw-bold fs-5 p-0 focus-ring-0"
            style={{ color: '#ffffff' }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 border border-secondary border-opacity-25 rounded p-2 overflow-x-auto" style={{ backgroundColor: '#0d1117' }}>
          <div className="d-flex align-items-center gap-1" style={{ minWidth: 'max-content' }}>
            {toolbarIcons.map((item, idx) => (
              item.separator ? (
                <div key={idx} className="vr mx-2 bg-secondary opacity-50" style={{ height: '20px' }}></div>
              ) : (
                <button
                  key={idx}
                  className={`btn btn-sm d-flex align-items-center justify-content-center p-0 ${item.color
                      ? `${item.color.startsWith('btn') ? item.color : ''} ${item.color.startsWith('text') ? 'btn-link ' + item.color : ''}`
                      : item.dark
                        ? 'btn-dark text-secondary'
                        : 'btn-link text-secondary hover-text-white'
                    }`}
                  style={{ width: '32px', height: '32px' }}
                  title={item.label}
                >
                  {item.label && !item.icon ? (
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.label}</span>
                  ) : (
                    <i className={`bi ${item.icon}`}></i>
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
            className="rounded border border-secondary border-opacity-50 shadow-lg cursor-crosshair"
            style={{ backgroundColor: '#10b981', maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Steps Section - Fixed at bottom */}
      <div className="flex-shrink-0 border-top border-secondary border-opacity-25 px-4 py-3" style={{ backgroundColor: 'rgba(13, 17, 23, 0.5)' }}>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <button
                onClick={addStep}
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
              >
                <i className="bi bi-plus-lg"></i> Añadir Paso
              </button>
              <div className="btn-group btn-group-sm bg-dark border border-secondary border-opacity-25 rounded overflow-hidden" role="group">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="btn btn-dark text-secondary border-end border-secondary border-opacity-25"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="btn btn-dark text-secondary border-end border-secondary border-opacity-25">
                  <i className="bi bi-play-fill"></i>
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={currentStep >= steps.length}
                  className="btn btn-dark text-secondary"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <span className="text-secondary small">Paso {currentStep + 1} de {steps.length + 1}</span>
          </div>

          <div className="d-flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {steps.length === 0 ? (
              <div className="flex-shrink-0 d-flex align-items-center justify-content-center border border-dashed border-secondary border-opacity-50 rounded bg-dark" style={{ width: '120px', height: '80px' }}>
                <p className="text-secondary small text-center mb-0 px-2" style={{ fontSize: '10px' }}>
                  No hay pasos. Añade uno.
                </p>
              </div>
            ) : (
              steps.map((src, idx) => (
                <div
                  key={idx}
                  className={`position-relative flex-shrink-0 rounded overflow-hidden cursor-pointer transition-all ${currentStep === idx
                      ? 'border border-2 border-primary shadow'
                      : 'border border-secondary border-opacity-25 hover-border-secondary'
                    }`}
                  style={{ width: '120px', height: '80px' }}
                  onClick={() => setCurrentStep(idx)}
                >
                  <img
                    src={src}
                    className="w-100 h-100 object-fit-cover"
                    alt={`Paso ${idx + 1}`}
                  />
                  <div className="position-absolute bottom-0 start-0 m-1 bg-black bg-opacity-75 text-white rounded px-1 fw-bold" style={{ fontSize: '10px' }}>
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
