
import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Seleccionar fecha", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [showYearSelect, setShowYearSelect] = useState(false);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearSelect(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const calendarHeight = 300;

      setCoords({
        top: spaceBelow < calendarHeight ? rect.top - calendarHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = selected.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const selectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setShowYearSelect(false);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const renderCalendar = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const calendarDays = [];

    for (let i = 0; i < startDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} style={{ padding: '0.5rem' }}></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
      const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();

      calendarDays.push(
        <button
          key={d}
          type="button"
          onClick={() => selectDate(d)}
          style={{
            padding: '0.5rem',
            fontSize: '11px',
            borderRadius: '0.375rem',
            transition: 'all 0.2s',
            border: isToday ? '1px solid rgba(59, 130, 246, 0.5)' : 'none',
            backgroundColor: isSelected ? '#1f6feb' : 'transparent',
            color: isSelected ? '#fff' : (isToday ? '#3b82f6' : '#94a3b8'),
            cursor: 'pointer',
            fontWeight: isSelected ? '700' : '400',
            textAlign: 'center'
          }}
          className="calendar-day-btn"
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = '#1c212a';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isToday ? '#3b82f6' : '#94a3b8';
            }
          }}
        >
          {d}
        </button>
      );
    }

    return calendarDays;
  };

  const renderYearSelector = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear + 10; i >= currentYear - 90; i--) {
      years.push(i);
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.25rem',
        overflowY: 'auto',
        maxHeight: '12rem',
        padding: '0.5rem'
      }}>
        {years.map(y => (
          <button
            key={y}
            onClick={(e) => { e.stopPropagation(); selectYear(y); }}
            style={{
              padding: '0.375rem',
              fontSize: '10px',
              borderRadius: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: viewDate.getFullYear() === y ? '#3b82f6' : '#94a3b8',
              fontWeight: viewDate.getFullYear() === y ? '700' : '400'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c212a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  const formattedValue = value ? value.split('-').reverse().join('/') : '';

  return (
    <div className={`datepicker-container ${className}`} ref={containerRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-control"
        style={{
          backgroundColor: '#0d1117',
          borderColor: '#1c212a',
          color: value ? '#fff' : '#94a3b8',
          padding: '0.625rem 1rem 0.625rem 2.5rem',
          fontSize: '0.875rem',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <i className="far fa-calendar" style={{ position: 'absolute', left: '1rem', color: '#94a3b8' }}></i>
        <span>{formattedValue || placeholder}</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            width: '18rem',
            backgroundColor: '#161b22',
            border: '1px solid #1c212a',
            borderRadius: '0.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            top: coords.top,
            left: coords.left
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', borderRadius: '0.25rem' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c212a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="fas fa-chevron-left" style={{ fontSize: '10px' }}></i>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={() => setShowYearSelect(!showYearSelect)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
                >
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  <i className={`fas fa-caret-down`} style={{ fontSize: '8px', transition: 'transform 0.2s', transform: showYearSelect ? 'rotate(180deg)' : 'none' }}></i>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', borderRadius: '0.25rem' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1c212a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i>
              </button>
            </div>

            {showYearSelect ? renderYearSelector() : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '0.5rem' }}>
                  {days.map(d => <span key={d} style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{d}</span>)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                  {renderCalendar()}
                </div>
              </>
            )}
          </div>

          {!showYearSelect && (
            <div style={{
              padding: '0.5rem',
              borderTop: '1px solid #1c212a',
              backgroundColor: 'rgba(0,0,0,0.2)',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={() => { onChange(''); setIsOpen(false); }}
                style={{ background: 'none', border: 'none', fontSize: '9px', color: '#ef4444', fontWeight: '700', textTransform: 'uppercase', padding: '0 0.5rem', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
              >
                Limpiar
              </button>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange(today);
                  setIsOpen(false);
                }}
                style={{ background: 'none', border: 'none', fontSize: '9px', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase', padding: '0 0.5rem', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#3b82f6'}
              >
                Hoy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
