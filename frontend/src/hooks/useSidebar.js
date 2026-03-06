import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    // Always default to true (visible) - ignore localStorage on first load
    // This ensures sidebar is always visible by default
    return true;
  });

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggle = () => {
    setIsOpen(prev => {
      const newState = !prev;
      console.log('Sidebar toggle:', newState ? 'opening' : 'closing');
      return newState;
    });
  };

  const open = () => {
    console.log('Sidebar: opening');
    setIsOpen(true);
  };
  
  const close = () => {
    console.log('Sidebar: closing');
    setIsOpen(false);
  };

  return {
    isOpen,
    toggle,
    open,
    close
  };
};