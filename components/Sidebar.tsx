
import React, { useEffect, useRef } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { sidebarShow, setSidebarShow, sidebarUnfoldable } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    principal: 'Principal',
    deportivo: 'Deportivo',
    academico: 'Académico',
    financiero: 'Financiero',
    servicios: 'Servicios',
    sistema: 'Sistema',
  };

  // Cerrar sidebar en móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 992 && sidebarShow) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          // No cerrar si se hace clic en el botón toggle
          if (!target.closest('[data-sidebar-toggle]')) {
            setSidebarShow(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarShow, setSidebarShow]);

  // Cerrar en móvil al seleccionar un item
  const handleNavClick = (itemId: string) => {
    onViewChange(itemId);
    if (window.innerWidth < 992) {
      setSidebarShow(false);
    }
  };

  const sidebarClasses = [
    'sidebar-coreui',
    sidebarShow ? 'show' : '',
    sidebarUnfoldable ? 'unfoldable' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarShow && window.innerWidth < 992 && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarShow(false)}
        />
      )}
      
      <div ref={sidebarRef} className={sidebarClasses}>
        <div className="sidebar-brand">
          <div className="brand-link">
            <img src="/images/logo.png" alt="ADHSOFT SPORT" className="brand-image" />
            <span className="brand-text">ADHSOFT SPORT</span>
          </div>
        </div>

        <div className="sidebar-nav-wrapper">
          <nav className="sidebar-nav">
            {Object.entries(menuSections).map(([sectionKey, items]) => (
              <div key={sectionKey} className="nav-group">
                <div className="nav-group-title">
                  <span>{sectionTitles[sectionKey]}</span>
                </div>
                <ul className="nav-list">
                  {items.map((item) => (
                    <li className="nav-item" key={item.id}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavClick(item.id);
                        }}
                        className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                        title={item.name}
                      >
                        <i className={`nav-icon bi ${item.icon}`}></i>
                        <span className="nav-text">{item.name}</span>
                        {currentView === item.id && <div className="active-indicator"></div>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="footer-content">
            <i className="bi bi-info-circle"></i>
            <span className="footer-text">v2.0.1</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
