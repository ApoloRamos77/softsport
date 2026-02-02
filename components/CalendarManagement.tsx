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
      // Load each data source independently - don't fail completely if one fails
      // NOTE: For birthdays, we need ALL students, not just the first page
      // Use direct fetch with pageSize parameter since getAll() doesn't support it
      const alumnosPromise = fetch('/api/alumnos?pageSize=1000')
        .then(response => response.json())
        .then(data => {
          // Handle paginated response
          if (data && typeof data === 'object' && 'data' in data) {
            return data.data || [];
          }
          return [];
        })
        .catch(error => {
          console.error('Error loading alumnos:', error);
          return [];
        });

      const trainingsPromise = apiService.getAll<Training>('trainings')
        .then(data => {
          // Handle both array and paginated response
          if (Array.isArray(data)) {
            return data;
          } else if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
          }
          return [];
        })
        .catch(error => {
          console.error('Error loading trainings:', error);
          return [];
        });

      const gamesPromise = apiService.getAll<Game>('games')
        .then(data => {
          // Handle both array and paginated response
          if (Array.isArray(data)) {
            return data;
          } else if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || [];
          }
          return [];
        })
        .catch(error => {
          console.error('Error loading games:', error);
          return [];
        });

      const [alumnosData, trainingsData, gamesData] = await Promise.all([
        alumnosPromise,
        trainingsPromise,
        gamesPromise
      ]);

      // Ensure all are arrays before setting state
      // NOTE: We DON'T filter by fechaAnulacion for birthdays - we want to show all student birthdays
      setAlumnos(Array.isArray(alumnosData) ? alumnosData : []);
      setTrainings(Array.isArray(trainingsData) ? trainingsData : []);
      setGames(Array.isArray(gamesData) ? gamesData : []);

      const alumnosCount = Array.isArray(alumnosData) ? alumnosData.length : 0;
      const trainingsCount = Array.isArray(trainingsData) ? trainingsData.length : 0;
      const gamesCount = Array.isArray(gamesData) ? gamesData.length : 0;

      console.log(`Loaded ${alumnosCount} alumnos, ${trainingsCount} trainings, ${gamesCount} games`);

      // DEBUG: Check if Nory (ID 22) is in the loaded data
      if (Array.isArray(alumnosData)) {
        const nory = alumnosData.find(a => a.id === 22);
        if (nory) {
          console.log('✅ NORY FOUND IN LOADED DATA:', {
            id: nory.id,
            nombre: nory.nombre,
            apellido: nory.apellido,
            fechaNacimiento: nory.fechaNacimiento,
            fechaAnulacion: nory.fechaAnulacion
          });
        } else {
          console.log('❌ NORY (ID 22) NOT FOUND IN API RESPONSE');
          console.log('   Student IDs in response:', alumnosData.map(a => a.id).sort((a, b) => a - b));
        }
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debug: Log all students with birth dates when data changes
  useEffect(() => {
    if (alumnos.length > 0) {
      console.log('\n========================================');
      console.log('STUDENTS WITH BIRTH DATES');
      console.log('========================================');
      const studentsWithBirthdays = alumnos.filter(a => a.fechaNacimiento);
      console.log(`Total students: ${alumnos.length}, With birthdays: ${studentsWithBirthdays.length}`);
      console.log('----------------------------------------');

      if (studentsWithBirthdays.length === 0) {
        console.warn('⚠️ NO STUDENTS HAVE BIRTH DATES!');
      } else {
        const currentMonth = currentDate.getMonth(); // 0=enero, 1=febrero, etc.
        console.log(`\n📅 Current calendar month: ${currentMonth + 1} (${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentMonth]})`);

        // SPECIAL DEBUG: List February birthdays FIRST
        console.log('\n🎂🎂🎂 FEBRUARY BIRTHDAYS (Month 1 in 0-11 index) 🎂🎂🎂');
        const febStudents = studentsWithBirthdays.filter(a => {
          const bday = new Date(a.fechaNacimiento!);
          return bday.getUTCMonth() === 1;  // February is index 1
        });

        if (febStudents.length === 0) {
          console.log('  ❌ NO FEBRUARY BIRTHDAYS FOUND IN DATABASE');
        } else {
          console.log(`  ✅ Found ${febStudents.length} student(s) with February birthdays:`);
          febStudents.forEach(a => {
            const bday = new Date(a.fechaNacimiento!);
            console.log(`     • ${a.nombre} ${a.apellido} - Feb ${bday.getUTCDate()}`);
          });
        }
        console.log('🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂🎂\n');

        console.log('\nAll students with birthdays:');

        studentsWithBirthdays.forEach(a => {
          const bday = new Date(a.fechaNacimiento!);
          const monthUTC = bday.getUTCMonth();
          const dayUTC = bday.getUTCDate();
          const monthLocal = bday.getMonth();
          const dayLocal = bday.getDate();
          const isCurrentMonth = monthUTC === currentMonth;

          // Highlight February birthdays specifically
          const isFeb = monthUTC === 1;  // February is index 1
          const prefix = isFeb ? '🎂 FEB >>> ' : (isCurrentMonth ? '🎂 ' : '  ');

          console.log(`${prefix}${a.nombre} ${a.apellido}:`, {
            raw: a.fechaNacimiento,
            'UTC Month (0-11)': monthUTC,
            'UTC Month (1-12)': monthUTC + 1,
            'UTC Day': dayUTC,
            'Local Month (0-11)': monthLocal,
            'Local Day': dayLocal,
            inCurrentMonth: isCurrentMonth,
            IS_FEBRUARY: isFeb
          });
        });

        console.log('\n🎯 Birthdays THIS MONTH:');
        const thisMonthBirthdays = studentsWithBirthdays.filter(a => {
          const bday = new Date(a.fechaNacimiento!);
          return bday.getUTCMonth() === currentMonth;
        });

        if (thisMonthBirthdays.length === 0) {
          console.log('  ❌ None');
        } else {
          thisMonthBirthdays.forEach(a => {
            const bday = new Date(a.fechaNacimiento!);
            console.log(`  ✅ ${a.nombre} ${a.apellido} - Day ${bday.getUTCDate()}`);
          });
        }
      }
      console.log('========================================\n');
    }
  }, [alumnos, currentDate]);

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

    // Get the current month being viewed in the calendar
    const currentCalendarMonth = currentDate.getMonth(); // The month the user is looking at
    const currentCalendarYear = currentDate.getFullYear();

    // Birthdays (ignoring year, only comparing month and day)
    // IMPORTANT: Only show birthdays when viewing the CURRENT CALENDAR MONTH
    // This prevents showing birthdays in the gray "next month" / "prev month" cells
    const dayBirthdays = alumnos.filter(a => {
      if (!a.fechaNacimiento) return false;

      // Parse fecha de nacimiento - handle different date formats
      let bday: Date;
      try {
        // Try parsing as ISO string first
        bday = new Date(a.fechaNacimiento);

        // Check if date is valid
        if (isNaN(bday.getTime())) {
          console.warn(`Invalid birth date for ${a.nombre}: ${a.fechaNacimiento}`);
          return false;
        }

        // USE UTC METHODS to avoid timezone shifting the day
        // When you have "1984-02-15T05:00:00.000Z", getDate() might return 14 in some timezones
        // getUTCDate() always gives the correct day regardless of timezone
        const birthdayMonth = bday.getUTCMonth();
        const birthdayDay = bday.getUTCDate();

        // KEY FIX: Only show birthdays when:
        // 1. The birthday month matches the CELL'S month
        // 2. The birthday day matches the CELL'S day
        // 3. The cell is in the CURRENT CALENDAR MONTH being viewed (prevents showing in gray prev/next month cells)
        // NOTE: We don't check year - birthdays repeat every year!
        const isCurrentMonthCell = month === currentCalendarMonth;
        const matches = birthdayMonth === month && birthdayDay === day && isCurrentMonthCell;

        // Enhanced Debug log - log for february birthdays specifically
        if (birthdayMonth === 1) {  // February is month index 1
          console.log(`🔍 [Feb Birthday Debug] ${a.nombre} ${a.apellido}:`, {
            fechaNacimiento: a.fechaNacimiento,
            birthdayMonth_UTC: birthdayMonth,  // 0-11
            birthdayDay_UTC: birthdayDay,
            cellMonth: month,  // 0-11
            cellDay: day,
            currentCalendarMonth: currentCalendarMonth,  // 0-11
            isCurrentMonthCell: isCurrentMonthCell,
            monthMatches: birthdayMonth === month,
            dayMatches: birthdayDay === day,
            FINAL_matches: matches
          });
        }

        // Log successful matches
        if (matches) {
          console.log(`🎂 [Birthday Match] ${a.nombre} ${a.apellido}:`, {
            fechaNacimiento: a.fechaNacimiento,
            birthdayMonth_UTC: birthdayMonth + 1,  // +1 for human-readable month
            birthdayDay_UTC: birthdayDay,
            cellMonth: month + 1,  // +1 for human-readable month
            cellDay: day,
            cellYear: year,
            isCurrentMonthCell: isCurrentMonthCell,
            currentViewingMonth: currentCalendarMonth + 1
          });
        }

        return matches;
      } catch (error) {
        console.error(`Error parsing birth date for ${a.nombre}: ${a.fechaNacimiento}`, error);
        return false;
      }
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

                        // Debug: Log if there are birthdays for this day
                        if (birthdays.length > 0) {
                          console.log(`📅 Rendering day ${d.month + 1}/${d.day}/${d.year}: ${birthdays.length} birthdays`, birthdays.map(b => b.nombre));
                        }

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
