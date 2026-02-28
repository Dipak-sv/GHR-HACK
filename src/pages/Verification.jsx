

import React from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationPanel from '../components/VerificationPanel';

const Verification = () => {
    const navigate = useNavigate();

    // Retrieve extracted data (temporary mock until API integration)
    const mockExtractedData = [
        {
            name: 'Amoxicillin',
            type: 'Capsule',
            dosage: '500mg',
            frequency: '1 capsule every 8 hours',
            duration: '7 Days',
            confidence: 94,
            instructions: 'Take every 8 hours. Complete the full course even if you feel better.'
        },
        {
            name: 'Ibuprofen',
            type: 'Tablet',
            dosage: '400mg',
            frequency: '1 tablet as needed',
            duration: 'Up to 5 Days',
            confidence: 98,
            instructions: 'Take only when necessary for pain. Do not exceed 3 tablets in 24 hours.'
        }
    ];

    const handleConfirm = (data) => {
        // Save verified data for summary page
        localStorage.setItem('verifiedData', JSON.stringify(data));
        navigate('/confirmation');
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Verify Extracted Prescription Data
                </h2>

                <VerificationPanel
                    initialData={mockExtractedData}
                    onConfirm={handleConfirm}
                />
            </div>
        </div>
    );
};

export default Verification;