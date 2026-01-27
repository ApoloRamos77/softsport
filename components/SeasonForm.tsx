
import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import { Season, apiService } from '../services/api';

interface SeasonFormProps {
  season?: Season | null;
  onCancel: () => void;
  onSave?: () => void;
}

const SeasonForm: React.FC<SeasonFormProps> = ({ season, onCancel, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [dates, setDates] = useState({ inicio: '', fin: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (season) {
      setNombre(season.nombre || '');
      setIsActive(season.activo || false);
      setDates({
        inicio: season.fechaInicio ? season.fechaInicio.split('T')[0] : '',
        fin: season.fechaFin ? season.fechaFin.split('T')[0] : ''
      });
    }
  }, [season]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert('Por favor ingrese un nombre para la temporada');
      return;
    }

    setSaving(true);
    try {
      const seasonData = {
        nombre: nombre.trim(),
        fechaInicio: dates.inicio ? `${dates.inicio}T00:00:00` : undefined,
        fechaFin: dates.fin ? `${dates.fin}T00:00:00` : undefined,
        activo: isActive
      };

      if (season?.id) {
        // Modo edición
        await apiService.update('seasons', season.id, {
          ...seasonData,
          id: season.id
        });
      } else {
        // Modo creación
        await apiService.create('seasons', seasonData);
      }

      onSave?.();
    } catch (error) {
      console.error('Error al guardar temporada:', error);
      alert('Error al guardar la temporada');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="card shadow-lg border-secondary border-opacity-25" style={{ backgroundColor: '#161b22' }}>
        <div className="card-body p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">
              {season?.id ? 'Editar Temporada' : 'Nueva Temporada'}
            </h2>
            <p className="text-secondary small mb-0">
              {season?.id ? 'Modifica los datos de la temporada' : 'Crea una nueva temporada para organizar tus entrenamientos y juegos'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-group">
              <label className="form-label text-secondary small fw-bold">Nombre</label>
              <input
                type="text"
                placeholder="Ej: Temporada 2025"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="form-control border-secondary border-opacity-25 text-white placeholder-secondary"
                style={{ backgroundColor: '#0d1117' }}
                required
              />
            </div>

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Fecha de Inicio</label>
                <DatePicker
                  value={dates.inicio}
                  onChange={(d) => setDates({ ...dates, inicio: d })}
                  placeholder="Seleccionar"
                />
              </div>
              <div className="col-6">
                <label className="form-label text-secondary small fw-bold">Fecha de Fin</label>
                <DatePicker
                  value={dates.fin}
                  onChange={(d) => setDates({ ...dates, fin: d })}
                  placeholder="Seleccionar"
                />
              </div>
            </div>

            <div className="card border-secondary border-opacity-25 p-3 d-flex flex-row justify-content-between align-items-center mt-2" style={{ backgroundColor: '#0d1117' }}>
              <div className="max-w-75">
                <p className="text-white fw-bold small mb-1">Temporada Activa</p>
                <p className="text-secondary small mb-0" style={{ fontSize: '11px' }}>
                  Marcar como la temporada activa actual (se desactivarán las demás)
                </p>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  style={{ backgroundColor: isActive ? '#1f6feb' : '#30363d', borderColor: 'transparent', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="btn btn-outline-secondary text-white border-secondary border-opacity-25 hover-bg-dark-lighter"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ backgroundColor: '#1f6feb', borderColor: '#1f6feb' }}
              >
                {saving ? (season?.id ? 'Guardando...' : 'Creando...') : (season?.id ? 'Guardar Cambios' : 'Crear Temporada')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SeasonForm;
