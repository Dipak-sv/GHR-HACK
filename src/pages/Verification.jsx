import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, AlertCircle, Printer } from 'lucide-react';
import VerificationPanel from '../components/VerificationPanel';
import { confirmPrescription, simplifyPrescription } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
    { value: 'english', label: '🇬🇧 English' },
    { value: 'hindi', label: '🇮🇳 Hindi (हिंदी)' },
    { value: 'marathi', label: '🇮🇳 Marathi (मराठी)' },
];

const Verification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isPatient = user?.role === 'patient';
    const isPharmacist = user?.role === 'pharmacist';

    // ── Pull real data passed from Upload page ─────────────
    const {
        sessionId,
        extractedData,
        safetyAnalysis,
        summary,
        simplifiedText: initialSimplifiedText,
        language: initialLanguage,
    } = location.state || {};

    const currentData = location.state?.translatedData || extractedData;

    const [language, setLanguage] = useState(initialLanguage || 'english');
    const [simplifiedText, setSimplifiedText] = useState(initialSimplifiedText || '');
    const [translatedData, setTranslatedData] = useState(currentData);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isChangingLang, setIsChangingLang] = useState(false);
    const [error, setError] = useState('');

    if (!sessionId || !extractedData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <p className="text-slate-600 font-medium">
                        No prescription data found. Please upload a prescription first.
                    </p>
                    <button
                        onClick={() => navigate('/upload')}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium"
                    >
                        ← Back to Upload
                    </button>
                </div>
            </div>
        );
    }

    const handleLanguageChange = async (newLang) => {
        setLanguage(newLang);
        setIsChangingLang(true);
        setError('');
        try {
            const result = await simplifyPrescription(sessionId, newLang);
            if (result.translatedData) {
                setSimplifiedText(result.simplifiedText);
                setTranslatedData(result.translatedData);
            } else {
                setSimplifiedText(result.simplifiedText || result);
                setTranslatedData(extractedData);
            }
        } catch (err) {
            setError('Could not load instructions for this language. Please try again.');
        } finally {
            setIsChangingLang(false);
        }
    };

    const handleConfirm = async (verifiedMedicines) => {
        setIsConfirming(true);
        setError('');
        try {
            const result = await confirmPrescription(sessionId, verifiedMedicines, language);
            navigate('/print', {
                state: {
                    sessionId,
                    extractedData: { ...extractedData, medicines: verifiedMedicines },
                    safetyAnalysis,
                    summary,
                    simplifiedText,
                    language,
                    confirmedAt: new Date().toISOString(),
                    prescriptionId: result.prescriptionId,
                },
            });
        } catch (err) {
            setError(err.message || 'Failed to confirm prescription. Please try again.');
            setIsConfirming(false);
        }
    };

    const risk = safetyAnalysis?.overallRisk || 'medium';
    const safetyScore = safetyAnalysis?.safetyScore || 0;

    // ─────────────────────────────────────────────────────────────
    // PATIENT VIEW 👤
    // ─────────────────────────────────────────────────────────────
    if (isPatient) {
        const patientMedicines = translatedData?.medicines || extractedData.medicines || [];

        // Render friendly safety indicator without numbers
        let safetyMessage = '';
        let safetyBg = '';
        if (safetyScore >= 80) {
            safetyMessage = 'Your prescription looks good ✅';
            safetyBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        } else if (safetyScore >= 50) {
            safetyMessage = 'Please follow instructions carefully ⚠️';
            safetyBg = 'bg-amber-50 text-amber-800 border-amber-200';
        } else {
            safetyMessage = 'Please confirm with your doctor 🔴';
            safetyBg = 'bg-rose-50 text-rose-800 border-rose-200';
        }

        const handlePrintRedirect = () => {
            navigate('/print', {
                state: {
                    sessionId,
                    extractedData,
                    safetyAnalysis,
                    summary,
                    simplifiedText,
                    language,
                    confirmedAt: new Date().toISOString()
                }
            });
        };

        return (
            <div className="min-h-screen bg-slate-50 py-10 px-4">
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your Prescription Summary</h1>
                        <p className="text-slate-500 font-medium tracking-wide">
                            Doctor: <span className="text-slate-700">{translatedData?.doctorName || extractedData.doctorName || '—'}</span> |
                            Date: <span className="text-slate-700">{translatedData?.date || extractedData.date || '—'}</span>
                        </p>
                    </div>

                    {/* Patient Instructions (Prominent) */}
                    <div className="bg-white border-2 border-teal-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                        <h2 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
                            <span>📝</span> Instructions
                        </h2>
                        <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                            {simplifiedText}
                        </p>
                    </div>

                    {/* Safety Indicator */}
                    <div className={`p-6 rounded-2xl border text-center font-bold text-lg shadow-sm ${safetyBg}`}>
                        {safetyMessage}
                    </div>

                    {/* Medicines List Simple */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-700 ml-2">Your Medicines ({patientMedicines.length})</h3>
                        {patientMedicines.map((med, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                {/* Medicine name + type */}
                                <div className="flex items-center gap-3 mb-4">
                                    <h4 className="text-xl font-bold text-slate-800">{med.name || '—'}</h4>
                                    <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {med.type || 'tablet'}
                                    </span>
                                    {med.dosage && (
                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
                                            {med.dosage}
                                        </span>
                                    )}
                                </div>

                                {/* 3-column details grid */}
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">🕐 How Often</p>
                                        <p className="text-slate-800 font-semibold">{med.frequency || 'As directed'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">🍽️ With Food</p>
                                        <p className="text-slate-800 font-semibold">{med.timing || 'As directed'}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">📅 Duration</p>
                                        <p className="text-slate-800 font-semibold">{med.duration || 'As directed'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                    {/* Print Action */}
                    <div className="pt-8 text-center pb-10">
                        <button
                            onClick={handlePrintRedirect}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                        >
                            <Printer className="w-5 h-5" /> View & Print Report
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // PHARMACIST VIEW 💊
    // ─────────────────────────────────────────────────────────────
    const riskColor = risk === 'low' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : risk === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-rose-50 border-rose-200 text-rose-700';
    const riskEmoji = risk === 'low' ? '✅' : risk === 'medium' ? '⚠️' : '🔴';

    return (
        <div className="min-h-screen bg-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Patient + Safety header */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                            { label: 'Patient', value: translatedData?.patientName || extractedData.patientName },
                            { label: 'Doctor', value: translatedData?.doctorName || extractedData.doctorName },
                            { label: 'Date', value: translatedData?.date || extractedData.date },
                            { label: 'Diagnosis', value: translatedData?.diagnosis || extractedData.diagnosis },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                                <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    <div className={`flex items-center justify-between rounded-2xl border p-4 ${riskColor}`}>
                        <div>
                            <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Safety Score</p>
                            <p className="text-2xl font-bold">{summary?.safety?.display || `${safetyAnalysis?.safetyScore}/100 ${riskEmoji}`}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p>{summary?.safety?.criticalCount ?? 0} critical</p>
                            <p>{summary?.safety?.warningCount ?? 0} warnings</p>
                        </div>
                    </div>

                    {/* Raw flags rendering for Pharmacist */}
                    {safetyAnalysis?.flags?.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {safetyAnalysis.flags.map((f, i) => (
                                <div key={i} className={`text-sm p-3 rounded-xl border flex items-start gap-2 ${f.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                    <span className="font-bold">{f.severity === 'CRITICAL' ? '🔴' : '⚠️'}</span>
                                    <span>{f.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Verification panel */}
                    <VerificationPanel
                        initialData={translatedData?.medicines || extractedData.medicines || []}
                        onConfirm={handleConfirm}
                        isConfirming={isConfirming}
                    />

                    {/* Right: Simplified instructions & Language Switcher */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-700">Patient Instructions</h3>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    disabled={isChangingLang}
                                    className="text-sm border border-slate-200 rounded-xl px-3 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                >
                                    {LANGUAGES.map((l) => (
                                        <option key={l.value} value={l.value}>{l.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {isChangingLang ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center space-y-3">
                                    <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-sm text-slate-500">Translating instructions…</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-teal-50 rounded-2xl border border-teal-100 p-4 overflow-y-auto">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {simplifiedText || 'Instructions will appear here after translation.'}
                                </p>
                            </div>
                        )}

                        {/* Raw JSON viewer for Pharmacist */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Raw Extracted Data</p>
                            <pre className="bg-slate-50 text-[10px] text-slate-500 p-4 rounded-xl overflow-x-auto max-h-40">
                                {JSON.stringify(extractedData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Verification;