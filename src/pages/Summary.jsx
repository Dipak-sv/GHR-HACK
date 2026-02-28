

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Clock } from 'lucide-react';

const Summary = () => {
    const navigate = useNavigate();
    const data = JSON.parse(localStorage.getItem("verifiedData")) || [];

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Upload
                    </button>

                    <button className="flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                        Clean Prescription Summary
                    </h2>

                    {data.length === 0 ? (
                        <p className="text-slate-500">No verified prescription data found.</p>
                    ) : (
                        <div className="space-y-6">
                            {data.map((med, idx) => (
                                <div
                                    key={idx}
                                    className="border border-slate-200 rounded-2xl p-6 bg-slate-50"
                                >
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                        {med.name}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-600">Dosage:</span>
                                            <p className="text-slate-800">{med.dosage}</p>
                                        </div>

                                        <div>
                                            <span className="font-medium text-slate-600">Frequency:</span>
                                            <p className="text-slate-800">{med.frequency}</p>
                                        </div>

                                        <div>
                                            <span className="font-medium text-slate-600">Duration:</span>
                                            <p className="text-slate-800">{med.duration}</p>
                                        </div>

                                        <div>
                                            <span className="font-medium text-slate-600">Reminder:</span>
                                            <p className="text-slate-800 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-teal-600" />
                                                Morning / Afternoon / Night
                                            </p>
                                        </div>
                                    </div>

                                    {med.instructions && (
                                        <div className="mt-4 bg-teal-50 border border-teal-100 rounded-xl p-4">
                                            <p className="text-sm text-teal-800 font-medium">
                                                {med.instructions}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Summary;