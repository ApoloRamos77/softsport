import React, { useState, useEffect } from 'react';
import { apiService, Alumno, Training, Game } from '../services/api';

const CalendarManagement: React.FC = () => {
  const [viewType, setViewType] = useState<'Mes' | 'Semana' | 'Día' | 'Agenda'>('Mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alumnosData, trainingsData, gamesData] = await Promise.all([
        apiService.getAll<Alumno>('alumnos'),
        apiService.getAll<Training>('trainings'),
        apiService.getAll<Game>('games')
      ]);
      setAlumnos(alumnosData.filter(a => !a.fechaAnulacion));
      setTrainings(trainingsData);
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];

    // Previous month filling
    const firstDayIndex = date.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, month: month - 1, year, currentMonth: false });
    }

    // Current month
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push({ day: i, month, year, currentMonth: true });
    }

    // Next month filling
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, month: month + 1, year, currentMonth: false });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const getEventsForDay = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const dayTrainings = trainings.filter(t => t.fecha && t.fecha.startsWith(dateStr));
    const dayGames = games.filter(g => g.fecha && g.fecha.startsWith(dateStr));

    // Birthdays (ignoring year)
    const dayBirthdays = alumnos.filter(a => {
      if (!a.fechaNacimiento) return false;
      const bday = new Date(a.fechaNacimiento);
      return bday.getMonth() === month && bday.getDate() === day;
    });

    return {
      trainings: dayTrainings,
      games: dayGames,
      birthdays: dayBirthdays
    };
  };

  const totalEvents = trainings.length + games.length;
  const upcomingTrainings = trainings.filter(t => t.fecha && new Date(t.fecha) > new Date()).length;
  const upcomingGames = games.filter(g => g.fecha && new Date(g.fecha) > new Date()).length;

  const stats = [
    { label: 'Total Eventos', value: totalEvents.toString(), sub: 'Entrenamientos y juegos', icon: 'fa-calendar' },
    { label: 'Próximos Entrenamientos', value: upcomingTrainings.toString(), sub: 'Programados', icon: 'fa-running' },
    { label: 'Próximos Juegos', value: upcomingGames.toString(), sub: 'Programados', icon: 'fa-trophy' },
  ];

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: '#0d1117', minHeight: '80vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 d-flex flex-column gap-4">
        <div className="d-flex justify-content-between align-items-end mb-2">
          <div>
            <h2 className="mb-1 text-white fw-bold h4">Calendario de Actividades</h2>
            <p className="text-secondary mb-0 small">Visualización mensual de entrenamientos, juegos y cumpleaños</p>
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
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8' }}></div>
                <span className="text-secondary fw-bold" style={{ fontSize: '11px' }}>Cumpleaños</span>
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
        <div className="card border-0 shadow-lg" style={{ backgroundColor: '#0f1419' }}>
          <div className="card-header bg-transparent border-bottom border-secondary border-opacity-25 p-4 py-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <h5 className="mb-0 text-white fw-bold fs-6">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h5>
                <div className="btn-group btn-group-sm">
                  <button onClick={() => changeMonth(-1)} className="btn btn-outline-secondary border-opacity-25 px-2 py-0"><i className="bi bi-chevron-left"></i></button>
                  <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline-secondary border-opacity-25 px-3 py-0 small fw-bold" style={{ fontSize: '11px' }}>Hoy</button>
                  <button onClick={() => changeMonth(1)} className="btn btn-outline-secondary border-opacity-25 px-2 py-0"><i className="bi bi-chevron-right"></i></button>
                </div>
              </div>
              <span className="text-secondary opacity-75 small" style={{ fontSize: '11px' }}>Vista de {viewType}</span>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive overflow-hidden">
              <table className="table table-bordered border-secondary border-opacity-10 mb-0 align-top table-fixed" style={{ tableLayout: 'fixed' }}>
                <thead style={{ backgroundColor: '#161b22' }}>
                  <tr>
                    {daysOfWeek.map(day => (
                      <th key={day} className="text-center py-2 text-secondary fw-bold border-bottom border-secondary border-opacity-25" style={{ fontSize: '11px' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => (
                    <tr key={weekIdx} style={{ height: '120px' }}>
                      {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((d, dayIdx) => {
                        const { trainings, games, birthdays } = getEventsForDay(d.day, d.month, d.year);
                        const today = isToday(d.day, d.month, d.year);

                        return (
                          <td
                            key={dayIdx}
                            className={`p-2 transition-all hover-bg-dark-lighter border-secondary border-opacity-10 ${!d.currentMonth ? 'opacity-25' : ''} ${today ? 'bg-primary bg-opacity-5' : ''}`}
                            style={{ cursor: 'pointer', verticalAlign: 'top' }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className={`${today ? 'bg-primary text-white rounded-circle d-flex align-items-center justify-center' : (dayIdx === 0 || dayIdx === 6 ? 'text-secondary opacity-50' : 'text-white')} fw-bold`}
                                style={today ? { width: '22px', height: '22px', fontSize: '12px', marginTop: '-2px' } : { fontSize: '12px' }}>
                                {d.day}
                              </span>
                            </div>

                            <div className="d-flex flex-column gap-1 overflow-hidden" style={{ maxHeight: '85px' }}>
                              {trainings.map(t => (
                                <div key={t.id} className="badge w-100 text-start bg-success bg-opacity-10 text-success border border-success border-opacity-10 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                  <i className="bi bi-person-arms-up me-1"></i> {t.titulo}
                                </div>
                              ))}
                              {games.map(g => (
                                <div key={g.id} className="badge w-100 text-start bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                  <i className="bi bi-trophy me-1"></i> {g.equipoLocal} vs {g.equipoVisitante}
                                </div>
                              ))}
                              {birthdays.map(a => (
                                <div key={a.id} className="badge w-100 text-start bg-info bg-opacity-10 text-info border border-info border-opacity-10 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                  <i className="fa fa-birthday-cake me-1"></i> Cumple: {a.nombre}
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
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
