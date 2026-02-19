
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from './contexts/SidebarContext';
import Layout from './components/Layout';
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
import LandingPage from './components/LandingPage';
import LandingPageManagement from './components/LandingPageManagement';
import PersonalManagement from './components/PersonalManagement';
import NutritionalManagementPage from './components/NutritionalManagementPage';
import PeriodosPagoManagement from './components/PeriodosPagoManagement';

type View = 'representantes' | 'servicios' | 'grupos' | 'categorias' | 'atletas' | 'entrenamientos' | 'becas' | 'productos' | 'pagos' | 'ingresos' | 'egresos' | 'abonos' | 'usuarios' | 'tablero' | 'juegos' | 'calendario' | 'temporadas' | 'dashboard' | 'academia_config' | 'perfil' | 'configuracion' | 'landing_mgmt' | 'personal' | 'nutricion' | 'periodos';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
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

    // Check for login query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
      setShowLogin(true);
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
      document.body.className = 'layout-fixed bg-body-tertiary';

      // Redirect to first allowed view if dashboard is not allowed
      const savedPermissions = localStorage.getItem('userPermissions');
      if (savedPermissions) {
        try {
          const permissions = JSON.parse(savedPermissions);
          const role = localStorage.getItem('userRole');

          // Skip check for Admin fallback (if needed)
          if (role === 'Administrador' && permissions.length === 0) return;

          // Check if dashboard is allowed
          const dashboardAllowed = permissions.some((p: any) => p.moduloKey === 'dashboard' && p.ver);

          if (!dashboardAllowed && permissions.length > 0) {
            // Find first allowed module
            const firstAllowed = permissions.find((p: any) => p.ver);
            if (firstAllowed && firstAllowed.moduloKey) {
              setCurrentView(firstAllowed.moduloKey as View);
            }
          }
        } catch (e) {
          console.error("Error checking permissions for redirect", e);
        }
      }

    } else {
      document.body.className = 'hold-transition login-page';
    }
  }, [isAuthenticated]);

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
    setShowLogin(false);
    setCurrentView('dashboard');
  };

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    if (showLogin) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={(v) => setCurrentView(v as View)} />;
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
      case 'landing_mgmt': return <LandingPageManagement />;
      case 'personal': return <PersonalManagement />;
      case 'nutricion': return <NutritionalManagementPage />;
      case 'periodos': return <PeriodosPagoManagement />;
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
      case 'landing_mgmt': return 'Gestión de Página Web';
      case 'personal': return 'Mantenimiento de Personal';
      case 'nutricion': return 'Nutrición Deportiva';
      case 'periodos': return 'Períodos de Pago';
      default: return 'Panel de Control';
    }
  };

  return (
    <SidebarProvider>
      <Layout
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view as View)}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
        getTitle={getTitle}
      >
        {renderView()}
      </Layout>
    </SidebarProvider>
  );
};

export default App;
