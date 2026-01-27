import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  currentView: string;
  onViewChange: (view: string) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  children: React.ReactNode;
  getTitle: () => string;
}

const Layout: React.FC<LayoutProps> = ({
  currentView,
  onViewChange,
  darkMode,
  toggleTheme,
  onLogout,
  onNavigate,
  children,
  getTitle,
}) => {
  return (
    <>
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      
      {/* Navbar - Siempre visible */}
      <Navbar
        onNavigate={onNavigate}
        darkMode={darkMode}
        toggleTheme={toggleTheme}
        onLogout={onLogout}
      />

      {/* Main Content */}
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
          <div className="container-fluid">{children}</div>
        </div>
      </main>
    </>
  );
};

export default Layout;
