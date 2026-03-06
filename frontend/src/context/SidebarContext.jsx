import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    const toggle = () => setIsOpen(prev => !prev);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebarContext = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
};
