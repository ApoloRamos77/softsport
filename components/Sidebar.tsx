
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'bi-speedometer2' },
    { id: 'calendario', name: 'Calendario', icon: 'bi-calendar3' },
    { id: 'temporadas', name: 'Temporadas', icon: 'bi-arrow-clockwise' },
    { id: 'representantes', name: 'Representantes', icon: 'bi-people' },
    { id: 'atletas', name: 'Alumnos', icon: 'bi-person-badge' },
    { id: 'entrenamientos', name: 'Entrenamientos', icon: 'bi-activity' },
    { id: 'juegos', name: 'Juegos', icon: 'bi-trophy' },
    { id: 'tablero', name: 'Tablero Táctico', icon: 'bi-diagram-3' },
    { id: 'ingresos', name: 'Ingresos', icon: 'bi-cash-stack' },
    { id: 'egresos', name: 'Egresos', icon: 'bi-wallet2' },
    { id: 'abonos', name: 'Abonos', icon: 'bi-receipt' },
    { id: 'becas', name: 'Becas', icon: 'bi-mortarboard' },
    { id: 'productos', name: 'Productos', icon: 'bi-box-seam' },
    { id: 'servicios', name: 'Servicios', icon: 'bi-gear' },
    { id: 'grupos', name: 'Grupos', icon: 'bi-collection' },
    { id: 'categorias', name: 'Categorías', icon: 'bi-tags' },
    { id: 'usuarios', name: 'Usuarios', icon: 'bi-shield-lock' },
    { id: 'pagos', name: 'Métodos de Pago', icon: 'bi-credit-card' },
  ];

  return (
    <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
      <div className="sidebar-brand">
        <a href="#" className="brand-link">
          <img src="/images/logo.png" alt="ADHSOFT SPORT" className="brand-image" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <span className="brand-text fw-bold ms-2">ADHSOFT SPORT</span>
        </a>
      </div>

      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu" data-accordion="false">
            {menuItems.map((item) => (
              <li className="nav-item" key={item.id}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onViewChange(item.id);
                  }}
                  className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                >
                  <i className={`nav-icon bi ${item.icon}`}></i>
                  <p>{item.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
