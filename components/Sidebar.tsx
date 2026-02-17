
import React, { useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

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
  salud: [
    { id: 'nutricion', name: 'Nutrición Deportiva', icon: 'bi-heart-pulse-fill' },
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
    { id: 'personal', name: 'Personal', icon: 'bi-person-vcard-fill' },
    { id: 'landing_mgmt', name: 'Página Web', icon: 'bi-browser-chrome' },
  ],
};

const sectionTitles: { [key: string]: string } = {
  principal: 'PRINCIPAL',
  deportivo: 'DEPORTIVO',
  academico: 'ACADÉMICO',
  salud: 'SALUD',
  financiero: 'FINANCIERO',
  servicios: 'SERVICIOS',
  sistema: 'SISTEMA',
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { visible, unfoldable, setSidebarVisible } = useSidebar();
  const [userPermissions, setUserPermissions] = React.useState<any[]>([]);
  // Use state to trigger re-render properly
  const [filteredSections, setFilteredSections] = React.useState<typeof menuSections>({ ...menuSections });

  useEffect(() => {
    const savedPermissions = localStorage.getItem('userPermissions');
    const role = localStorage.getItem('userRole');

    if (savedPermissions) {
      try {
        const permissions = JSON.parse(savedPermissions);
        setUserPermissions(permissions);

        // Filter sections immediately
        const filtered: any = {};
        Object.entries(menuSections).forEach(([key, items]) => {
          const visibleItems = items.filter(item => {
            // Always show dashboard - REMOVED to respect DB permissions
            // if (item.id === 'dashboard') return true;

            // If admin, maybe show all?
            // Ideally admin permissions are all true in DB.
            // But as a fallback during migration:
            if (role === 'Administrador' && permissions.length === 0) return true;

            const perm = permissions.find((p: any) => p?.moduloKey === item.id);
            return perm ? perm.ver : false;
          });

          if (visibleItems.length > 0) {
            filtered[key] = visibleItems;
          }
        });
        setFilteredSections(filtered);
      } catch (e) {
        console.error("Error parsing permissions", e);
        setFilteredSections(menuSections); // Fallback
      }
    } else {
      // Fallback for when no permissions (e.g. first login or old session)
      setFilteredSections(menuSections);
    }
  }, []);

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
        {/* Scrollable area: logo, brand, nav */}
        <div className="sidebar-scroll">
          <div className="sidebar-brand">
            <img src="/images/logo.png" alt="Logo" className="brand-logo" />
            <span className="brand-name">ADHSOFT SPORT</span>
          </div>
          <div className="sidebar-nav">
            {Object.entries(filteredSections).map(([sectionKey, items]) => (
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
        </div>
        {/* Footer fuera del scroll, siempre visible */}
        <div className="sidebar-footer">
          <i className="bi bi-info-circle"></i>
          <span className="footer-text">v2.0.1</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
