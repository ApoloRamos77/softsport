
import React, { useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { visible, unfoldable, setSidebarVisible } = useSidebar();

  const menuSections = {
    principal: [
      { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
      { id: 'calendario', name: 'Calendario', icon: 'bi-calendar-event' },
      { id: 'temporadas', name: 'Temporadas', icon: 'bi-arrow-repeat' },
    ],
    deportivo: [
      { id: 'entrenamientos', name: 'Entrenamientos', icon: 'bi-activity' },
      { id: 'juegos', name: 'Juegos', icon: 'bi-trophy-fill' },
      { id: 'tablero', name: 'Tablero Táctico', icon: 'bi-diagram-3-fill' },
    ],
    academico: [
      { id: 'atletas', name: 'Alumnos', icon: 'bi-person-badge-fill' },
      { id: 'representantes', name: 'Representantes', icon: 'bi-people-fill' },
      { id: 'grupos', name: 'Grupos', icon: 'bi-collection-fill' },
      { id: 'categorias', name: 'Categorías', icon: 'bi-tags-fill' },
      { id: 'becas', name: 'Becas', icon: 'bi-mortarboard-fill' },
    ],
    financiero: [
      { id: 'ingresos', name: 'Ingresos', icon: 'bi-cash-stack' },
      { id: 'egresos', name: 'Egresos', icon: 'bi-wallet2' },
      { id: 'abonos', name: 'Abonos', icon: 'bi-receipt-cutoff' },
      { id: 'pagos', name: 'Métodos de Pago', icon: 'bi-credit-card-fill' },
    ],
    servicios: [
      { id: 'productos', name: 'Productos', icon: 'bi-box-seam-fill' },
      { id: 'servicios', name: 'Servicios', icon: 'bi-gear-fill' },
    ],
    sistema: [
      { id: 'usuarios', name: 'Usuarios', icon: 'bi-shield-lock-fill' },
    ],
  };

  const sectionTitles: { [key: string]: string } = {
    principal: 'PRINCIPAL',
    deportivo: 'DEPORTIVO',
    academico: 'ACADÉMICO',
    financiero: 'FINANCIERO',
    servicios: 'SERVICIOS',
    sistema: 'SISTEMA',
  };

  // Responsive: cerrar en móvil, abrir en desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarVisible]);

  const handleNavClick = (itemId: string) => {
    onViewChange(itemId);
    // Cerrar en móvil después de seleccionar
    if (window.innerWidth < 992) {
      setSidebarVisible(false);
    }
  };

  const sidebarClasses = ['sidebar', visible && 'sidebar-visible', unfoldable && 'sidebar-narrow']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Backdrop para móvil */}
      {visible && window.innerWidth < 992 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarVisible(false)} />
      )}

      <div className={sidebarClasses}>
        {/* Brand */}
        <div className="sidebar-brand">
          <img src="/images/logo.png" alt="Logo" className="brand-logo" />
          <span className="brand-name">ADHSOFT SPORT</span>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {Object.entries(menuSections).map(([sectionKey, items]) => (
            <div key={sectionKey} className="nav-section">
              <div className="nav-section-title">{sectionTitles[sectionKey]}</div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  title={item.name}
                >
                  <i className={`bi ${item.icon} nav-icon`}></i>
                  <span className="nav-label">{item.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <i className="bi bi-info-circle"></i>
          <span className="footer-text">v2.0.1</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
