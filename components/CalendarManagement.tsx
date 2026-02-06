import React, { useState, useEffect } from 'react';
import { apiService, Alumno, Training, Game } from '../services/api';

const CalendarManagement: React.FC = () => {
  const [viewType, setViewType] = useState<'Mes' | 'Semana' | 'Día' | 'Agenda'>('Mes');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  // 🚀 VERSION LOG - Para verificar deployment
  console.log('%c🚀 CALENDAR v2026-02-03 08:58 - API Service Fix', 'background: #22C55E; color: white; font-size: 18px; font-weight: bold; padding: 10px;');

  const loadData = async () => {
    setLoading(true);
    try {
      // Load each data source independently - don't fail completely if one fails
      // NOTE: For birthdays, we need ALL students, not just the first page
      const alumnosPromise = apiService.getAlumnos({ pageSize: 1000 })
        .then(result => {
          // getPaginated returns { totalCount, data }
          return result.data || [];
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
      console.log(`Total students: ${alumnos.length}, With birthdays: ${studentsWithBirthdays.length} `);
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
          console.log(`  ✅ Found ${febStudents.length} student(s) with February birthdays: `);
          febStudents.forEach(a => {
            const bday = new Date(a.fechaNacimiento!);
            console.log(`     • ${a.nombre} ${a.apellido} - Feb ${bday.getUTCDate()} `);
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

          console.log(`${prefix}${a.nombre} ${a.apellido}: `, {
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
            console.log(`  ✅ ${a.nombre} ${a.apellido} - Day ${bday.getUTCDate()} `);
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
          console.warn(`Invalid birth date for ${a.nombre}: ${a.fechaNacimiento} `);
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
          console.log(`🔍[Feb Birthday Debug] ${a.nombre} ${a.apellido}: `, {
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
          console.log(`🎂[Birthday Match] ${a.nombre} ${a.apellido}: `, {
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
        console.error(`Error parsing birth date for ${a.nombre}: ${a.fechaNacimiento} `, error);
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

  // Helper functions for Week and Day views
  const getWeekDays = (date: Date) => {
    const days = [];
    const current = new Date(date);
    // Get Monday of current week
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    current.setDate(diff);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hour = parseInt(parts[0]);
      const min = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${min} ${ampm}`;
    }
    return timeStr;
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const daysOfWeekNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    return (
      <div className="table-responsive">
        <table className="table table-bordered border-secondary border-opacity-10 mb-0">
          <thead style={{ backgroundColor: '#161b22' }}>
            <tr>
              {weekDays.map((day, idx) => {
                const dayName = daysOfWeekNames[(day.getDay())];
                const isCurrentDay = isToday(day.getDate(), day.getMonth(), day.getFullYear());
                return (
                  <th key={idx} className={`text-center py-3 border-bottom border-secondary border-opacity-25 ${isCurrentDay ? 'bg-primary bg-opacity-10' : ''}`}>
                    <div className={`fw-bold ${isCurrentDay ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '11px' }}>{dayName}</div>
                    <div className={`mt-1 ${isCurrentDay ? 'text-primary fw-bold' : 'text-white'}`} style={{ fontSize: '20px' }}>{day.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDays.map((day, idx) => {
                const { trainings, games, birthdays } = getEventsForDay(day.getDate(), day.getMonth(), day.getFullYear());
                return (
                  <td key={idx} className="align-top p-2" style={{ minHeight: '400px', verticalAlign: 'top' }}>
                    <div className="d-flex flex-column gap-2">
                      {trainings.map(t => (
                        <div key={t.id} className="card border-success border-opacity-25 bg-success bg-opacity-5">
                          <div className="card-body p-2">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <i className="bi bi-person-workout text-success" style={{ fontSize: '18px' }}></i>
                              <span className="text-success fw-bold small">{t.titulo}</span>
                            </div>
                            {t.horaInicio && (
                              <div className="text-secondary small">
                                <i className="bi bi-clock me-1"></i>
                                {formatTime(t.horaInicio)} {t.horaFin && `- ${formatTime(t.horaFin)}`}
                              </div>
                            )}
                            {t.ubicacion && (
                              <div className="text-secondary small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {t.ubicacion}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {games.map(g => (
                        <div key={g.id} className="card border-warning border-opacity-25 bg-warning bg-opacity-5">
                          <div className="card-body p-2">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '18px' }}></i>
                              <span className="text-warning fw-bold small">{g.equipoLocal} vs {g.equipoVisitante}</span>
                            </div>
                            {g.horaInicio && (
                              <div className="text-secondary small">
                                <i className="bi bi-clock me-1"></i>
                                {formatTime(g.horaInicio)}
                              </div>
                            )}
                            {g.ubicacion && (
                              <div className="text-secondary small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {g.ubicacion}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {birthdays.map(a => (
                        <div key={a.id} className="card border-info border-opacity-25 bg-info bg-opacity-5">
                          <div className="card-body p-2">
                            <div className="d-flex align-items-center gap-2">
                              <i className="fa fa-birthday-cake text-info" style={{ fontSize: '16px' }}></i>
                              <span className="text-info small">{a.nombre} {a.apellido}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const { trainings, games, birthdays } = getEventsForDay(
      currentDate.getDate(),
      currentDate.getMonth(),
      currentDate.getFullYear()
    );

    const allEvents = [
      ...trainings.map(t => ({ ...t, type: 'training' as const })),
      ...games.map(g => ({ ...g, type: 'game' as const })),
      ...birthdays.map(b => ({ ...b, type: 'birthday' as const }))
    ];

    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-white mb-2 text-capitalize">
            {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
          <div className="btn-group">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-chevron-left"></i> Día anterior
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn btn-sm btn-outline-secondary"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
              className="btn btn-sm btn-outline-secondary"
            >
              Día siguiente <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        {allEvents.length === 0 ? (
          <div className="text-center text-secondary py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '48px' }}></i>
            <p className="mt-3">No hay eventos programados para este día</p>
          </div>
        ) : (
          <div className="row g-3">
            {trainings.map(t => (
              <div key={t.id} className="col-12">
                <div className="card border-success border-opacity-25 bg-success bg-opacity-5">
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-success bg-opacity-10 rounded p-3">
                        <i className="bi bi-person-workout text-success" style={{ fontSize: '32px' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="text-success mb-2">{t.titulo}</h5>
                        {t.descripcion && <p className="text-white-50 small mb-2">{t.descripcion}</p>}
                        <div className="d-flex flex-wrap gap-3">
                          {t.horaInicio && (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <i className="bi bi-clock me-1"></i>
                              {formatTime(t.horaInicio)} {t.horaFin && `- ${formatTime(t.horaFin)}`}
                            </span>
                          )}
                          {t.ubicacion && (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <i className="bi bi-geo-alt me-1"></i>
                              {t.ubicacion}
                            </span>
                          )}
                          {t.tipo && (
                            <span className="badge bg-success bg-opacity-10 text-success">
                              <i className="bi bi-tag me-1"></i>
                              {t.tipo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {games.map(g => (
              <div key={g.id} className="col-12">
                <div className="card border-warning border-opacity-25 bg-warning bg-opacity-5">
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-warning bg-opacity-10 rounded p-3">
                        <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '32px' }}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="text-warning mb-2">{g.equipoLocal} vs {g.equipoVisitante}</h5>
                        <div className="d-flex flex-wrap gap-3">
                          {g.horaInicio && (
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              <i className="bi bi-clock me-1"></i>
                              {formatTime(g.horaInicio)}
                            </span>
                          )}
                          {g.ubicacion && (
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              <i className="bi bi-geo-alt me-1"></i>
                              {g.ubicacion}
                            </span>
                          )}
                          {g.competicion && (
                            <span className="badge bg-warning bg-opacity-10 text-warning">
                              <i className="bi bi-trophy me-1"></i>
                              {g.competicion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {birthdays.map(a => (
              <div key={a.id} className="col-12">
                <div className="card border-info border-opacity-25 bg-info bg-opacity-5">
                  <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-info bg-opacity-10 rounded p-3">
                        <i className="fa fa-birthday-cake text-info" style={{ fontSize: '28px' }}></i>
                      </div>
                      <div>
                        <h6 className="text-info mb-0">🎉 Cumpleaños de {a.nombre} {a.apellido}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Agenda View
  const renderAgendaView = () => {
    const today = new Date();
    const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    const upcomingEvents: Array<{
      date: Date;
      type: 'training' | 'game' | 'birthday';
      data: any;
    }> = [];

    trainings.forEach(t => {
      if (t.fecha) {
        const eventDate = new Date(t.fecha);
        if (eventDate >= today && eventDate <= threeMonthsLater) {
          upcomingEvents.push({ date: eventDate, type: 'training', data: t });
        }
      }
    });

    games.forEach(g => {
      if (g.fecha) {
        const eventDate = new Date(g.fecha);
        if (eventDate >= today && eventDate <= threeMonthsLater) {
          upcomingEvents.push({ date: eventDate, type: 'game', data: g });
        }
      }
    });

    alumnos.forEach(a => {
      if (a.fechaNacimiento) {
        const bday = new Date(a.fechaNacimiento);
        const thisYearBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        if (thisYearBirthday >= today && thisYearBirthday <= threeMonthsLater) {
          upcomingEvents.push({ date: thisYearBirthday, type: 'birthday', data: a });
        }
      }
    });

    upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const groupedEvents = upcomingEvents.reduce((acc, event) => {
      const dateKey = event.date.toLocaleDateString('es-ES');
      if (!acc[dateKey]) {
        acc[dateKey] = { date: event.date, events: [] };
      }
      acc[dateKey].events.push(event);
      return acc;
    }, {} as Record<string, { date: Date; events: typeof upcomingEvents }>);

    return (
      <div className="p-4">
        <h3 className="text-white mb-4">Próximos Eventos</h3>
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center text-secondary py-5">
            <i className="bi bi-calendar-x" style={{ fontSize: '48px' }}></i>
            <p className="mt-3">No hay eventos programados para los próximos 3 meses</p>
          </div>
        ) : (
          <div className="accordion accordion-flush" id="agendaAccordion">
            {Object.entries(groupedEvents).map(([dateKey, { date, events }], idx) => {
              const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });

              return (
                <div key={dateKey} className="accordion-item bg-transparent border-secondary border-opacity-25 mb-2">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button bg-dark text-white collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#agenda-${idx}`}
                    >
                      <div className="d-flex align-items-center gap-3 w-100">
                        <div className="text-center" style={{ minWidth: '60px' }}>
                          <div className="fw-bold" style={{ fontSize: '24px' }}>{date.getDate()}</div>
                          <div className="text-secondary text-uppercase" style={{ fontSize: '11px' }}>{date.toLocaleDateString('es-ES', { month: 'short' })}</div>
                        </div>
                        <div>
                          <div className="fw-bold text-capitalize">{dayName}</div>
                          <div className="text-secondary small">{events.length} evento(s)</div>
                        </div>
                      </div>
                    </button>
                  </h2>
                  <div id={`agenda-${idx}`} className="accordion-collapse collapse" data-bs-parent="#agendaAccordion">
                    <div className="accordion-body bg-dark bg-opacity-50">
                      <div className="d-flex flex-column gap-3">
                        {events.map((event, eventIdx) => {
                          if (event.type === 'training') {
                            const t = event.data;
                            return (
                              <div key={eventIdx} className="d-flex gap-3 align-items-start">
                                <div className="bg-success bg-opacity-10 rounded p-2">
                                  <i className="bi bi-person-workout text-success" style={{ fontSize: '24px' }}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="text-success mb-1">{t.titulo}</h6>
                                  {t.descripcion && <p className="text-white-50 small mb-2">{t.descripcion}</p>}
                                  <div className="d-flex flex-wrap gap-2">
                                    {t.horaInicio && (
                                      <span className="badge bg-secondary bg-opacity-25 text-secondary">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatTime(t.horaInicio)} {t.horaFin && `- ${formatTime(t.horaFin)}`}
                                      </span>
                                    )}
                                    {t.ubicacion && (
                                      <span className="badge bg-secondary bg-opacity-25 text-secondary">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {t.ubicacion}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (event.type === 'game') {
                            const g = event.data;
                            return (
                              <div key={eventIdx} className="d-flex gap-3 align-items-start">
                                <div className="bg-warning bg-opacity-10 rounded p-2">
                                  <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '24px' }}></i>
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="text-warning mb-1">{g.equipoLocal} vs {g.equipoVisitante}</h6>
                                  <div className="d-flex flex-wrap gap-2">
                                    {g.horaInicio && (
                                      <span className="badge bg-secondary bg-opacity-25 text-secondary">
                                        <i className="bi bi-clock me-1"></i>
                                        {formatTime(g.horaInicio)}
                                      </span>
                                    )}
                                    {g.ubicacion && (
                                      <span className="badge bg-secondary bg-opacity-25 text-secondary">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {g.ubicacion}
                                      </span>
                                    )}
                                    {g.competicion && (
                                      <span className="badge bg-secondary bg-opacity-25 text-secondary">
                                        <i className="bi bi-trophy me-1"></i>
                                        {g.competicion}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          } else {
                            const a = event.data;
                            return (
                              <div key={eventIdx} className="d-flex gap-3 align-items-center">
                                <div className="bg-info bg-opacity-10 rounded p-2">
                                  <i className="fa fa-birthday-cake text-info" style={{ fontSize: '24px' }}></i>
                                </div>
                                <div>
                                  <h6 className="text-info mb-0">🎉 Cumpleaños de {a.nombre} {a.apellido}</h6>
                                </div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

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
                    <i className={`fas ${stat.icon} fs - 6`}></i>
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
                  className={`btn btn - sm border - 0 px - 3 fw - bold ${viewType === type ? 'btn-primary shadow-sm' : 'btn-link text-secondary text-decoration-none'} `}
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
            {viewType === 'Semana' && renderWeekView()}
            {viewType === 'Día' && renderDayView()}
            {viewType === 'Agenda' && renderAgendaView()}
            {viewType === 'Mes' && (
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
                    {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                      <tr key={weekIndex}>
                        {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((calDay, idx) => {
                          const events = getEventsForDay(calDay.day, calDay.month, calDay.year);
                          const isCurrentDay = isToday(calDay.day, calDay.month, calDay.year);
                          const hasEvents = events.trainings.length > 0 || events.games.length > 0 || events.birthdays.length > 0;

                          return (
                            <td
                              key={idx}
                              className={`
                                ${!calDay.currentMonth ? 'bg-dark bg-opacity-25 text-secondary' : ''}
                                ${isCurrentDay ? 'bg-primary bg-opacity-10' : ''}
                                border-secondary border-opacity-10 p-2 position-relative
                              `}
                              style={{ height: '110px', verticalAlign: 'top', cursor: calDay.currentMonth ? 'pointer' : 'default' }}
                            >
                              <div className="d-flex flex-column h-100">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <span
                                    className={`
                                      fw-bold
                                      ${isCurrentDay ? 'text-white bg-primary rounded-circle d-flex align-items-center justify-content-center' : !calDay.currentMonth ? 'text-secondary opacity-50' : 'text-white'}
                                    `}
                                    style={isCurrentDay ? { width: '24px', height: '24px', fontSize: '11px' } : { fontSize: '13px' }}
                                  >
                                    {calDay.day}
                                  </span>
                                  {hasEvents && calDay.currentMonth && (
                                    <div className="d-flex gap-1">
                                      {events.trainings.length > 0 && <div className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#10b981' }}></div>}
                                      {events.games.length > 0 && <div className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#f59e0b' }}></div>}
                                      {events.birthdays.length > 0 && <div className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6' }}></div>}
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex flex-column gap-1 overflow-hidden" style={{ maxHeight: '85px' }}>
                                  {events.trainings.map(t => (
                                    <div key={t.id} className="badge w-100 text-start bg-success text-white border border-success border-opacity-25 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                      <i className="bi bi-person-workout me-1"></i> {t.titulo}
                                    </div>
                                  ))}
                                  {events.games.map(g => (
                                    <div key={g.id} className="badge w-100 text-start bg-warning bg-opacity-10 text-warning border border-warning border-opacity-10 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                      <i className="bi bi-trophy-fill me-1"></i> {g.equipoLocal} vs {g.equipoVisitante}
                                    </div>
                                  ))}
                                  {events.birthdays.map(a => (
                                    <div key={a.id} className="badge w-100 text-start bg-info bg-opacity-10 text-info border border-info border-opacity-10 p-1 text-truncate" style={{ fontSize: '8px', fontWeight: '500' }}>
                                      <i className="fa fa-birthday-cake me-1"></i> {a.nombre}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;
