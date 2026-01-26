
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Calendario</h2>
        <p className="text-sm text-slate-400">Vista de entrenamientos y juegos programados</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-slate-800 p-5 rounded-lg relative overflow-hidden">
            <div className="flex flex-col">
              <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{stat.sub}</p>
            </div>
            <i className={`fas ${stat.icon} absolute right-4 top-4 text-slate-700/30 text-xl`}></i>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Leyenda</h4>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-xs font-semibold text-slate-300">Entrenamientos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-xs font-semibold text-slate-300">Juegos</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-900/30">
          <h3 className="text-sm font-bold">Calendario de Eventos</h3>
          <p className="text-[10px] text-slate-500 mt-1">Haz clic en un evento para ver sus detalles</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-1">
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 text-[11px] font-bold rounded border border-slate-700">Hoy</button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 text-[11px] font-bold rounded border border-slate-700">Anterior</button>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 text-[11px] font-bold rounded border border-slate-700">Siguiente</button>
            </div>
            
            <h4 className="text-base font-bold">Enero 2026</h4>

            <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-1">
              {['Mes', 'Semana', 'Día', 'Agenda'].map(type => (
                <button 
                  key={type}
                  onClick={() => setViewType(type as any)}
                  className={`px-4 py-1 text-[11px] font-bold rounded transition-all ${viewType === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 rounded overflow-hidden">
            {/* Header Days */}
            <div className="grid grid-cols-7 bg-slate-900/50 border-b border-slate-800">
              {daysOfWeek.map(day => (
                <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-400 border-r border-slate-800 last:border-0">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Cells */}
            {calendarGrid.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 border-b border-slate-800 last:border-0 min-h-[100px]">
                {week.map((day, dayIdx) => (
                  <div 
                    key={dayIdx} 
                    className={`p-2 border-r border-slate-800 last:border-0 relative hover:bg-slate-800/20 transition-colors ${day === 21 ? 'bg-blue-900/30' : ''}`}
                  >
                    <span className={`text-[10px] font-bold float-right ${dayIdx === 0 || dayIdx === 6 ? 'text-slate-500' : 'text-slate-300'} ${day === 21 ? 'text-blue-400 underline underline-offset-4' : ''}`}>
                      {day < 10 ? `0${day}` : day}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;
