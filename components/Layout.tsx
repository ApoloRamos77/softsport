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
    <div className="app-wrapper">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      <div className="app-container">
        <header className="app-header">
          <Navbar
            onNavigate={onNavigate}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
            onLogout={onLogout}
          />
        </header>
        <main className="app-main">
          <div className="app-content-header">
            <div className="main-container">
              <div className="row">
                <div className="col-12">
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
            <div className="main-container">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
