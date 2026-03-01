import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isPatient = user.role === 'patient';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl">🏥</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Prescripto</span>
        </div>

        {/* Right: User actions */}
        <div className="flex items-center gap-4">
          {/* Role badge */}
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 border shadow-sm
            ${isPatient ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-teal-50 text-teal-700 border-teal-200'}
          `}>
            <span>{isPatient ? '👤 Patient' : '💊 Pharmacist'}</span>
          </div>

          <div className="hidden sm:block text-sm font-medium text-slate-600 px-2">
            Hi, {user.name.split(' ')[0]}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-semibold px-3 py-2 rounded-xl hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
