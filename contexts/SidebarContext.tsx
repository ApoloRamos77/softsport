import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  visible: boolean;
  unfoldable: boolean;
  toggleSidebar: () => void;
  setUnfoldable: (value: boolean) => void;
  setSidebarVisible: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(true);
  const [unfoldable, setUnfoldable] = useState(false);

  const toggleSidebar = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  const setSidebarVisible = useCallback((value: boolean) => {
    setVisible(value);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        visible,
        unfoldable,
        toggleSidebar,
        setUnfoldable,
        setSidebarVisible,
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
