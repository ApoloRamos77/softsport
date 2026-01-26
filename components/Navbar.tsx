
import React, { useState, useEffect } from 'react';

interface NavbarProps {
  toggleSidebar: () => void;
  onNavigate: (view: any) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, onNavigate, darkMode, toggleTheme, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    nombre: 'Usuario',
    apellido: '',
    email: '',
    role: 'Usuario'
  });

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData({
          nombre: user.nombre || 'Usuario',
          apellido: user.apellido || '',
          email: user.email || '',
          role: user.role || 'Usuario'
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const getInitials = () => {
    const firstInitial = userData.nombre.charAt(0).toUpperCase();
    const lastInitial = userData.apellido.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const getFullName = () => {
    return `${userData.nombre} ${userData.apellido}`.trim();
  };

  return (
    <nav className="app-header navbar navbar-expand bg-body">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button" onClick={(e) => { e.preventDefault(); toggleSidebar(); }}>
              <i className="bi bi-list"></i>
            </a>
          </li>
        </ul>

        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); toggleTheme(); }}>
              <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </a>
          </li>

          <li className="nav-item dropdown user-menu">
            <a 
              href="#" 
              className="nav-link dropdown-toggle" 
              data-bs-toggle="dropdown"
              onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(!isUserMenuOpen); }}
            >
              <span className="d-none d-md-inline me-2">{getFullName()}</span>
              <i className="bi bi-person-circle"></i>
            </a>
            <ul className={`dropdown-menu dropdown-menu-lg dropdown-menu-end ${isUserMenuOpen ? 'show' : ''}`}>
              <li className="user-header bg-primary text-white">
                <p>
                  {getFullName()}
                  <small>{userData.role}</small>
                </p>
              </li>
              <li className="user-body">
                <div className="row">
                  <div className="col-12">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('academia_config'); setIsUserMenuOpen(false); }}>
                      <i className="bi bi-building me-2"></i>Academia
                    </a>
                  </div>
                  <div className="col-12">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('perfil'); setIsUserMenuOpen(false); }}>
                      <i className="bi bi-person me-2"></i>Perfil
                    </a>
                  </div>
                  <div className="col-12">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('configuracion'); setIsUserMenuOpen(false); }}>
                      <i className="bi bi-gear me-2"></i>Configuración
                    </a>
                  </div>
                </div>
              </li>
              <li className="user-footer">
                <a href="#" className="btn btn-default btn-flat btn-sm" onClick={(e) => { e.preventDefault(); onLogout && onLogout(); }}>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
