import React, { createContext, useContext, useState, useCallback } from 'react';
import GlobalAlertModal from '../components/GlobalAlertModal';

const GlobalAlertContext = createContext({
    showAlert: () => { },
    hideAlert: () => { },
});

export const useGlobalAlert = () => useContext(GlobalAlertContext);

export const GlobalAlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    const showAlert = useCallback((type, title, message) => {
        setAlert({ isOpen: true, type, title, message });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <GlobalAlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <GlobalAlertModal
                isOpen={alert.isOpen}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                onClose={hideAlert}
            />
        </GlobalAlertContext.Provider>
    );
};
