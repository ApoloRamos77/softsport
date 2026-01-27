
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onViewChange }) => {
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

  return (
    <aside className={`sidebar-modern ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-brand">
        <div className="brand-link">
          <img src="/images/logo.png" alt="ADHSOFT SPORT" className="brand-image" />
          {isOpen && <span className="brand-text">ADHSOFT SPORT</span>}
        </div>
      </div>

      <div className="sidebar-wrapper custom-scrollbar">
        <nav className="sidebar-nav">
          {Object.entries(menuSections).map(([sectionKey, items]) => (
            <div key={sectionKey} className="nav-group">
              {isOpen && (
                <div className="nav-group-title">
                  <span>{sectionTitles[sectionKey]}</span>
                </div>
              )}
              <ul className="nav-list">
                {items.map((item) => (
                  <li className="nav-item" key={item.id}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onViewChange(item.id);
                      }}
                      className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                      title={!isOpen ? item.name : undefined}
                    >
                      <i className={`nav-icon bi ${item.icon}`}></i>
                      {isOpen && <span className="nav-text">{item.name}</span>}
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
          {isOpen && <span className="footer-text">v2.0.1</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
