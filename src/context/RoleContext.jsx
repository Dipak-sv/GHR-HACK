import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const [role, setRole] = useState(null); // 'patient' or 'pharmacist'

    const value = {
        role,
        setRole,
        isAuthenticated: !!role,
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
