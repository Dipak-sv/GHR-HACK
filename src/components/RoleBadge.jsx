import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const RoleBadge = () => {
    const { role, setRole } = useRole();
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show badge on landing page
    if (!role || location.pathname === '/') {
        return null;
    }

    const handleLogout = () => {
        setRole(null);
        navigate('/');
    };

    const isPatient = role === 'patient';

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-md transition-all hover:scale-105 ${isPatient
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                    }`}
                title="Click to switch role"
            >
                <span className="text-lg">{isPatient ? '👤' : '💊'}</span>
                <span className="text-sm">{isPatient ? 'Patient' : 'Pharmacist'}</span>
            </button>
        </div>
    );
};

export default RoleBadge;
