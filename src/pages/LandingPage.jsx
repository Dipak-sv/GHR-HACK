import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState(['', '', '', '']);
    const [pinError, setPinError] = useState(false);

    const handlePatientClick = () => {
        setRole('patient');
        navigate('/upload');
    };

    const handlePharmacistClick = () => {
        setShowPinModal(true);
    };

    const handlePinChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        setPinError(false);
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            if (nextInput) nextInput.focus();
        }

        // Auto-submit on 4th digit
        if (index === 3 && value) {
            const fullPin = newPin.join('');
            if (fullPin === '1234') {
                setRole('pharmacist');
                navigate('/upload');
            } else {
                setPinError(true);
                setPin(['', '', '', '']);
                const firstInput = document.getElementById('pin-0');
                if (firstInput) firstInput.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4 relative">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-3 tracking-tight">Prescripto</h1>
                <p className="text-gray-500 text-lg md:text-xl">Intelligent Prescription Interpretation</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full justify-center items-stretch z-10">

                {/* Patient Card */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300 p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6">
                        👤
                    </div>
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">I am a Patient</h2>
                    <p className="text-gray-500 text-sm mb-8 flex-1">
                        View your prescription in simple language you can easily understand.
                    </p>
                    <button
                        onClick={handlePatientClick}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                        Continue as Patient
                    </button>
                </div>

                {/* Pharmacist Card */}
                <div className="flex-1 bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300 p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-4xl mb-6">
                        💊
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 mb-4">I am a Pharmacist</h2>
                    <p className="text-gray-500 text-sm mb-8 flex-1">
                        Review and verify AI extracted prescription data with full technical access.
                    </p>
                    <button
                        onClick={handlePharmacistClick}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                        Continue as Pharmacist
                    </button>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-sm font-medium text-gray-500 mb-4">Trusted by healthcare professionals</p>
                <div className="flex items-center justify-center gap-6 text-xs text-gray-400 font-semibold tracking-wide">
                    <span>99% ACCURACY</span>
                    <span>•</span>
                    <span>3 LANGUAGES</span>
                    <span>•</span>
                    <span>INSTANT RESULTS</span>
                </div>
            </div>

            {/* PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl">
                        <button
                            onClick={() => setShowPinModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Enter Pharmacist PIN</h3>

                        <div className="flex justify-center gap-3 mb-6">
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`pin-${index}`}
                                    type="password"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    autoFocus={index === 0}
                                    className={`w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${pinError
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50'
                                        : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                                        }`}
                                />
                            ))}
                        </div>

                        {pinError ? (
                            <p className="text-red-500 text-sm font-medium text-center animate-pulse">Invalid PIN. Please try again.</p>
                        ) : (
                            <p className="text-gray-400 text-sm text-center">Hint: Use 1234 for demo</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
