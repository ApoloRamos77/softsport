
import React, { useState } from 'react';

const CalendarManagement: React.FC = () => {
  const [viewType, setViewType] = useState<'Mes' | 'Semana' | 'Día' | 'Agenda'>('Mes');

  const stats = [
    { label: 'Total Eventos', value: '0', sub: 'Entrenamientos y juegos', icon: 'fa-calendar' },
    { label: 'Próximos Entrenamientos', value: '0', sub: 'Programados', icon: 'fa-running' },
    { label: 'Próximos Juegos', value: '0', sub: 'Programados', icon: 'fa-trophy' },
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Simulated grid for January 2026
  const calendarGrid = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Calendario de Actividades</h2>
            <p className="text-secondary mb-0 small">Visualización mensual de entrenamientos y encuentros deportivos</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {stats.map((stat, i) => (
            <div key={i} className="col-12 col-md-4">
              <div className="card h-100 border-0 shadow-sm" style={{ backgroundColor: '#161b22' }}>
                <div className="card-body d-flex justify-content-between align-items-start p-3">
                  <div>
                    <p className="text-secondary small fw-bold mb-1 text-uppercase" style={{ fontSize: '10px' }}>{stat.label}</p>
                    <h4 className="fw-bold mb-0 text-white font-monospace">{stat.value}</h4>
                    <small className="text-secondary opacity-50" style={{ fontSize: '10px' }}>{stat.sub}</small>
                  </div>
                  <div className="p-2 bg-primary bg-opacity-10 rounded text-primary border border-primary border-opacity-10">
                    <i className={`fas ${stat.icon} fs-6`}></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend & Controls */}
        <div className="card mb-4 border-0" style={{ backgroundColor: '#161b22' }}>
          <div className="card-body p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-4">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#10b981' }}></div>
                <span className="text-secondary fw-bold" style={{ fontSize: '11px' }}>Entrenamientos</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b' }}></div>
                <span className="text-secondary fw-bold" style={{ fontSize: '11px' }}>Juegos</span>
              </div>
            </div>

            <div className="btn-group btn-group-sm bg-[#0d1117] p-1 rounded border border-secondary border-opacity-25">
              {['Mes', 'Semana', 'Día', 'Agenda'].map(type => (
                <button
                  key={type}
                  onClick={() => setViewType(type as any)}
                  className={`btn btn-sm border-0 px-3 fw-bold ${viewType === type ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'}`}
                  style={viewType === type ? { backgroundColor: '#1f6feb' } : {}}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="card border-0 shadow-lg overflow-hidden" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 p-4 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <h5 className="mb-0 text-white fw-bold fs-6">Enero 2026</h5>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary border-opacity-25 px-2 py-0"><i className="bi bi-chevron-left"></i></button>
                  <button className="btn btn-outline-secondary border-opacity-25 px-3 py-0 small fw-bold" style={{ fontSize: '11px' }}>Hoy</button>
                  <button className="btn btn-outline-secondary border-opacity-25 px-2 py-0"><i className="bi bi-chevron-right"></i></button>
                </div>
              </div>
              <span className="text-secondary opacity-75 small" style={{ fontSize: '11px' }}>Vista de {viewType}</span>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered border-secondary border-opacity-10 mb-0 align-top">
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    {daysOfWeek.map(day => (
                      <th key={day} className="text-center py-2 text-secondary fw-bold border-bottom border-secondary border-opacity-25" style={{ fontSize: '11px', width: '14.28%' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarGrid.map((week, weekIdx) => (
                    <tr key={weekIdx} style={{ height: '100px' }}>
                      {week.map((day, dayIdx) => (
                        <td
                          key={dayIdx}
                          className={`p-2 transition-all hover-bg-dark-lighter border-secondary border-opacity-10 ${day === 21 ? 'bg-primary bg-opacity-5' : ''}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className={`${dayIdx === 0 || dayIdx === 6 ? 'text-secondary opacity-50' : 'text-white'} fw-bold`} style={{ fontSize: '12px' }}>
                              {day}
                            </span>
                          </div>
                          {day === 21 && (
                            <div className="d-flex flex-column gap-1">
                              <div className="badge w-100 text-start bg-success bg-opacity-10 text-success border border-success border-opacity-25 p-1" style={{ fontSize: '9px', fontWeight: 'normal' }}>
                                <i className="bi bi-person-arms-up me-1"></i> Entren. Sub-15
                              </div>
                              <div className="badge w-100 text-start bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 p-1" style={{ fontSize: '9px', fontWeight: 'normal' }}>
                                <i className="bi bi-trophy me-1"></i> Juego vs Elite
                              </div>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;
