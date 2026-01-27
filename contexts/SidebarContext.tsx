import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  sidebarShow: boolean;
  setSidebarShow: (show: boolean) => void;
  sidebarUnfoldable: boolean;
  setSidebarUnfoldable: (unfoldable: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(true);
  const [sidebarUnfoldable, setSidebarUnfoldable] = useState(false);

  const toggleSidebar = () => {
    setSidebarShow(!sidebarShow);
  };

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarShow(false);
      } else {
        setSidebarShow(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        sidebarShow,
        setSidebarShow,
        sidebarUnfoldable,
        setSidebarUnfoldable,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};
