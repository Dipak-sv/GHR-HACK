import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Processing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            navigate("/verification");
        }, 2000);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                AI is analyzing your prescription...
            </h3>
            <p className="text-slate-500">
                Extracting structured medicine data.
            </p>
        </div>
    );
};

export default Processing;
