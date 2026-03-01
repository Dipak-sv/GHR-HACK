import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center max-w-sm w-full">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
                <p className="text-slate-500 font-medium mb-8">
                    This section is restricted to Pharmacist accounts only.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-xl transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
