
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import RepresentativeManagement from './components/RepresentativeManagement';
import ServiceManagement from './components/ServiceManagement';
import GroupManagement from './components/GroupManagement';
import CategoryManagement from './components/CategoryManagement';
import AlumnoManagement from './components/AlumnoManagement';
import TrainingManagement from './components/TrainingManagement';
import ScholarshipManagement from './components/ScholarshipManagement';
import ProductManagement from './components/ProductManagement';
import PaymentMethodManagement from './components/PaymentMethodManagement';
import AccountingManagement from './components/AccountingManagement';
import ExpenseManagement from './components/ExpenseManagement';
import AbonoManagement from './components/AbonoManagement';
import UserManagement from './components/UserManagement';
import TacticalBoardManagement from './components/TacticalBoardManagement';
import GameManagement from './components/GameManagement';
import CalendarManagement from './components/CalendarManagement';
import SeasonManagement from './components/SeasonManagement';
import AcademyConfig from './components/AcademyConfig';
import ProfileSettings from './components/ProfileSettings';
import GeneralConfig from './components/GeneralConfig';
import Login from './components/Login';

type View = 'representantes' | 'servicios' | 'grupos' | 'categorias' | 'atletas' | 'entrenamientos' | 'becas' | 'productos' | 'pagos' | 'ingresos' | 'egresos' | 'abonos' | 'usuarios' | 'tablero' | 'juegos' | 'calendario' | 'temporadas' | 'dashboard' | 'academia_config' | 'perfil' | 'configuracion';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Inicializar sidebar según tamaño de pantalla
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 992;
  });
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Timeout de inactividad (15 minutos = 900000 ms)
  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
  let inactivityTimer: NodeJS.Timeout;

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // Sistema de timeout por inactividad
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        handleLogout();
        alert('Sesión cerrada por inactividad');
      }, INACTIVITY_TIMEOUT);
    };

    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer(); // Iniciar el timer

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Update body classes based on authentication status
    if (isAuthenticated) {
      const sidebarClass = isSidebarOpen ? 'sidebar-open' : 'sidebar-collapse';
      document.body.className = `layout-fixed ${sidebarClass} bg-body-tertiary`;
    } else {
      document.body.className = 'hold-transition login-page';
    }
  }, [isAuthenticated, isSidebarOpen]);

  // Cerrar sidebar al hacer clic en el overlay (móviles)
  useEffect(() => {
    if (!isAuthenticated || !isSidebarOpen || window.innerWidth >= 992) return;

    const handleOverlayClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === document.body.querySelector('body::before') || 
          (!target.closest('.app-sidebar') && window.innerWidth < 992)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleOverlayClick);
    return () => document.removeEventListener('click', handleOverlayClick);
  }, [isAuthenticated, isSidebarOpen]);

  // Responsive: Ajustar sidebar al cambiar tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'representantes': return <RepresentativeManagement />;
      case 'servicios': return <ServiceManagement />;
      case 'grupos': return <GroupManagement />;
      case 'categorias': return <CategoryManagement />;
      case 'atletas': return <AlumnoManagement />;
      case 'entrenamientos': return <TrainingManagement />;
      case 'juegos': return <GameManagement />;
      case 'calendario': return <CalendarManagement />;
      case 'temporadas': return <SeasonManagement />;
      case 'becas': return <ScholarshipManagement />;
      case 'productos': return <ProductManagement />;
      case 'pagos': return <PaymentMethodManagement />;
      case 'ingresos': return <AccountingManagement />;
      case 'egresos': return <ExpenseManagement />;
      case 'abonos': return <AbonoManagement />;
      case 'usuarios': return <UserManagement />;
      case 'tablero': return <TacticalBoardManagement />;
      case 'academia_config': return <AcademyConfig />;
      case 'perfil': return <ProfileSettings darkMode={darkMode} onToggleTheme={toggleTheme} />;
      case 'configuracion': return <GeneralConfig />;
      default:
        return (
          <div className="bg-white dark:bg-[#111827] p-8 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <h2 className="text-xl">Seleccione una opción del menú</h2>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'academia_config': return 'Gestión de Academia';
      case 'perfil': return 'Información Personal';
      case 'configuracion': return 'Configuración';
      case 'representantes': return 'Gestión de Representantes';
      case 'servicios': return 'Gestión de Servicios';
      case 'grupos': return 'Gestión de Grupos';
      case 'categorias': return 'Gestión de Categorías';
      case 'atletas': return 'Gestión de Alumnos';
      case 'entrenamientos': return 'Gestión de Entrenamientos';
      case 'juegos': return 'Gestión de Juegos';
      case 'calendario': return 'Calendario';
      case 'temporadas': return 'Temporadas';
      case 'becas': return 'Programas de Becas';
      case 'productos': return 'Productos';
      case 'pagos': return 'Métodos de Pago';
      case 'ingresos': return 'Ingresos';
      case 'egresos': return 'Egresos';
      case 'abonos': return 'Abonos';
      case 'usuarios': return 'Usuarios';
      case 'tablero': return 'Tablero Táctico';
      default: return 'Panel de Control';
    }
  };

  return (
    <>
      <Navbar 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onNavigate={setCurrentView}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        currentView={currentView} 
        onViewChange={(view) => setCurrentView(view as View)} 
      />

      <main className="app-main">
        <div className="app-content-header">
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6">
                <h3 className="mb-0">{getTitle()}</h3>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-end">
                  <li className="breadcrumb-item"><a href="#">Home</a></li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {getTitle()}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="app-content">
          <div className="container-fluid">
            {renderView()}
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
