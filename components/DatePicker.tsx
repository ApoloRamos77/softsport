
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
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().split('T')[0];
      const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toDateString();
      
      calendarDays.push(
        <button
          key={d}
          type="button"
          onClick={() => selectDate(d)}
          className={`p-2 text-[11px] rounded-md transition-all ${
            isSelected 
              ? 'bg-blue-600 text-white font-bold' 
              : isToday 
                ? 'border border-blue-500/50 text-blue-400' 
                : 'hover:bg-slate-700 text-slate-300'
          }`}
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
      <div className="grid grid-cols-3 gap-1 overflow-y-auto max-h-48 custom-scrollbar p-2">
        {years.map(y => (
          <button
            key={y}
            onClick={(e) => { e.stopPropagation(); selectYear(y); }}
            className={`py-1.5 text-[10px] rounded hover:bg-slate-700 ${viewDate.getFullYear() === y ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
          >
            {y}
          </button>
        ))}
      </div>
    );
  };

  const formattedValue = value ? value.split('-').reverse().join('/') : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="form-input-dark p-2.5 pl-10 rounded-md border text-white w-full text-xs cursor-pointer flex items-center relative transition-all duration-200 hover:border-blue-500/50"
      >
        <i className="far fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
        <span className={value ? "text-white" : "text-slate-500"}>
          {formattedValue || placeholder}
        </span>
      </div>

      {isOpen && (
        <div 
          className="fixed z-[9999] w-64 bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl overflow-hidden animate-fadeIn"
          style={{ top: coords.top, left: coords.left }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors">
                <i className="fas fa-chevron-left text-[10px]"></i>
              </button>
              
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowYearSelect(!showYearSelect)}
                  className="text-[11px] font-bold text-white uppercase tracking-wider hover:text-blue-400 flex items-center gap-1"
                >
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  <i className={`fas fa-caret-down text-[8px] transition-transform ${showYearSelect ? 'rotate-180' : ''}`}></i>
                </button>
              </div>

              <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 transition-colors">
                <i className="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
            
            {showYearSelect ? renderYearSelector() : (
              <>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {days.map(d => <span key={d} className="text-[9px] font-bold text-slate-500 uppercase">{d}</span>)}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendar()}
                </div>
              </>
            )}
          </div>
          
          {!showYearSelect && (
            <div className="p-2 border-t border-slate-700/50 bg-slate-900/30 flex justify-between">
              <button 
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase px-2"
              >
                Limpiar
              </button>
              <button 
                onClick={() => { 
                  const today = new Date().toISOString().split('T')[0];
                  onChange(today); 
                  setIsOpen(false); 
                }}
                className="text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase px-2"
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
