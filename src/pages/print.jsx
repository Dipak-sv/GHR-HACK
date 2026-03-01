import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck, Bell, BellOff, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CONF_COLOR = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100  text-amber-700  border-amber-200',
    low: 'bg-rose-100   text-rose-700   border-rose-200',
};

const RISK_COLOR = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50   text-amber-700  border-amber-200',
    high: 'bg-rose-50    text-rose-700   border-rose-200',
};

const Print = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isPatient = user?.role === 'patient';

    // ── Reminder state ─────────────────────────────────
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [durationDays, setDurationDays] = useState(7);
    const [reminderTimes, setReminderTimes] = useState({
        morning: true,
        afternoon: false,
        night: true
    });
    const [reminderLoading, setReminderLoading] = useState(false);
    const [reminderSuccess, setReminderSuccess] = useState(false);
    const [reminderError, setReminderError] = useState('');

    const {
        extractedData,
        safetyAnalysis,
        summary,
        simplifiedText,
        language,
        confirmedAt,
        sessionId
    } = location.state || {};

    // ── Guard ──────────────────────────────────────────
    if (!summary || !extractedData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <p className="text-slate-600 font-medium">No confirmed prescription found.</p>
                    <button
                        onClick={() => navigate('/upload')}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium"
                    >
                        ← Start New Upload
                    </button>
                </div>
            </div>
        );
    }

    const risk = safetyAnalysis?.overallRisk || 'medium';
    const riskColor = RISK_COLOR[risk] || RISK_COLOR.medium;
    const medicines = extractedData.medicines || [];
    const flags = safetyAnalysis?.flags || [];
    const printDate = confirmedAt
        ? new Date(confirmedAt).toLocaleString('en-IN')
        : new Date().toLocaleString('en-IN');

    const safetyScore = safetyAnalysis?.safetyScore || 0;
    let patientSafetyMessage = '';
    let patientSafetyBg = '';
    if (safetyScore >= 80) {
        patientSafetyMessage = 'Your prescription looks good ✅';
        patientSafetyBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    } else if (safetyScore >= 50) {
        patientSafetyMessage = 'Please follow instructions carefully ⚠️';
        patientSafetyBg = 'bg-amber-50 text-amber-800 border-amber-200';
    } else {
        patientSafetyMessage = 'Please confirm with your doctor 🔴';
        patientSafetyBg = 'bg-rose-50 text-rose-800 border-rose-200';
    }

    // ── Set Reminder ───────────────────────────────────
    const handleSetReminder = async () => {
        setReminderError('');

        if (!phoneNumber) {
            setReminderError('Please enter your phone number');
            return;
        }

        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            setReminderError('Use format: +91XXXXXXXXXX');
            return;
        }

        if (!reminderTimes.morning && !reminderTimes.afternoon && !reminderTimes.night) {
            setReminderError('Select at least one reminder time');
            return;
        }

        try {
            setReminderLoading(true);

            const res = await fetch(`${BASE_URL}/api/reminder/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    phoneNumber,
                    reminderTimes,
                    durationDays
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to set reminder');

            if (data.smsStatus === 'failed') {
                setReminderError(`Reminder saved, but SMS failed: ${data.smsError}. Ensure this number is Verified on your Twilio Trial account.`);
                setShowReminderForm(true);
            } else {
                setReminderSuccess(true);
                setShowReminderForm(false);
            }

        } catch (err) {
            setReminderError(err.message);
        } finally {
            setReminderLoading(false);
        }
    };

    return (
        <>
            {/* ── Print CSS ── */}
            <style>{`
        @media print {
          @page { margin: 10mm; }
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print-bg { padding: 0 !important; background: white !important; }
          .print-page { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

            <div className="min-h-screen bg-slate-100 no-print-bg py-8 px-4">

                {/* ── Nav bar ── */}
                <div className="no-print max-w-4xl mx-auto flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-sm transition"
                    >
                        <Printer className="w-4 h-4" /> Print Report
                    </button>
                </div>

                {/* ── Printable card ── */}
                <div className="print-page max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">

                    {/* Report header */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-teal-700 tracking-tight">Prescripto</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Intelligent Prescription Interpretation System</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPatient ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {isPatient ? 'Patient Report' : 'Pharmacist Technical Report'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Confirmed on</p>
                            <p className="text-sm font-semibold text-slate-600">{printDate}</p>
                            <p className="text-xs text-slate-400 mt-1">Language: {language || 'English'}</p>
                        </div>
                    </div>

                    {/* Patient info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 break-inside-avoid">
                        {[
                            { label: 'Patient Name', value: summary.header?.patientName },
                            { label: 'Doctor', value: summary.header?.doctorName },
                            { label: 'Date', value: summary.header?.date },
                            { label: 'Diagnosis', value: summary.header?.diagnosis },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                                <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Safety score */}
                    {isPatient ? (
                        <div className={`p-4 rounded-2xl border text-center font-bold text-lg break-inside-avoid ${patientSafetyBg}`}>
                            {patientSafetyMessage}
                        </div>
                    ) : (
                        <div className={`flex items-center justify-between rounded-2xl border p-4 ${riskColor} break-inside-avoid`}>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Safety Analysis</p>
                                <p className="text-2xl font-bold">{summary.safety?.display || `${safetyScore}/100`}</p>
                            </div>
                            <div className="text-right text-sm">
                                <p>{summary.safety?.criticalCount ?? 0} critical issue(s)</p>
                                <p>{summary.safety?.warningCount ?? 0} warning(s)</p>
                            </div>
                        </div>
                    )}

                    {/* Safety flags - Pharmacist only */}
                    {!isPatient && flags.length > 0 && (
                        <div className="space-y-2 break-inside-avoid pt-2">
                            <p className="text-sm font-semibold text-slate-600">Safety Flags</p>
                            {flags.map((f, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-2 rounded-xl border p-3 text-sm break-inside-avoid
                    ${f.severity === 'CRITICAL'
                                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                                            : 'bg-amber-50 border-amber-200 text-amber-700'}`}
                                >
                                    <span className="font-semibold">
                                        {f.severity === 'CRITICAL' ? '🔴' : '⚠️'}
                                    </span>
                                    <span>{f.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Medicines */}
                    <div>
                        <p className="text-sm font-semibold text-slate-600 mb-3">
                            Medicines ({medicines.length})
                        </p>
                        <div className="space-y-3">
                            {medicines.map((med, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 break-inside-avoid"
                                >
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="font-bold text-slate-800">{med.name || '—'}</p>
                                        <span className="text-xs font-medium text-slate-500 capitalize">{med.type || 'tablet'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">
                                            {isPatient ? 'When to take' : 'Dosage'}
                                        </p>
                                        <p className="text-sm text-slate-800 font-medium">
                                            {isPatient ? (med.frequency || '—') : (med.dosage || '—')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">
                                            {isPatient ? 'Timing' : 'Frequency'}
                                        </p>
                                        <p className="text-sm text-slate-800 font-medium">
                                            {isPatient ? (med.timing || '—') : (med.frequency || '—')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Duration</p>
                                        <p className="text-sm text-slate-800 font-medium">
                                            {isPatient
                                                ? (med.duration || 'As directed')
                                                : (`${med.timing || '—'} · ${med.duration || ''}`)}
                                        </p>
                                    </div>
                                    {!isPatient && (
                                        <div className="col-span-2 md:col-span-4 flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CONF_COLOR[med.confidence] || CONF_COLOR.medium}`}>
                                                {med.confidence} confidence
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Simplified instructions */}
                    {simplifiedText && (
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 break-inside-avoid mt-4">
                            <p className="text-sm font-semibold text-teal-700 mb-2">
                                Patient Instructions ({language})
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {simplifiedText}
                            </p>
                        </div>
                    )}

                    {/* Human verified stamp */}
                    {confirmedAt ? (
                        <div className="flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl py-5 break-inside-avoid mt-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            <div>
                                <p className="text-lg font-bold text-emerald-800">Human Verified ✓</p>
                                <p className="text-sm text-emerald-600">
                                    Reviewed and confirmed by a qualified person on {printDate}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl py-5 break-inside-avoid mt-4">
                            <ShieldCheck className="w-8 h-8 text-amber-600 opacity-60" />
                            <div>
                                <p className="text-lg font-bold text-amber-800">Pending Verification</p>
                                <p className="text-sm text-amber-700">
                                    This prescription is AI-generated and has not yet been verified by a pharmacist.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── REMINDER SECTION (hidden on print) ── */}
                    <div className="no-print border-t border-slate-200 pt-6 mt-4">

                        {reminderSuccess ? (
                            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                                <Bell className="w-6 h-6 text-emerald-600" />
                                <div>
                                    <p className="font-bold text-emerald-800">Reminders Set! ✅</p>
                                    <p className="text-sm text-emerald-600">
                                        You will receive SMS reminders for your medicines at the scheduled times.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-teal-600" />
                                        <p className="font-semibold text-slate-700">Set Medicine Reminders</p>
                                    </div>
                                    <button
                                        onClick={() => setShowReminderForm(!showReminderForm)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${showReminderForm
                                            ? 'bg-slate-100 text-slate-600'
                                            : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}
                                    >
                                        {showReminderForm ? 'Cancel' : 'Set Reminder'}
                                    </button>
                                </div>

                                {showReminderForm && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">

                                        {/* Phone number */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                                                <Phone className="inline w-4 h-4 mr-1" />
                                                Phone Number (with country code)
                                            </label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                                placeholder="+91XXXXXXXXXX"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            />
                                        </div>

                                        {/* Reminder times */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-600 mb-3">
                                                Reminder Times
                                            </label>
                                            <div className="flex gap-3">
                                                {[
                                                    { key: 'morning', label: '🌅 Morning', time: '8:00 AM' },
                                                    { key: 'afternoon', label: '☀️ Afternoon', time: '2:00 PM' },
                                                    { key: 'night', label: '🌙 Night', time: '9:00 PM' },
                                                ].map(({ key, label, time }) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setReminderTimes(prev => ({
                                                            ...prev,
                                                            [key]: !prev[key]
                                                        }))}
                                                        className={`flex-1 py-3 px-2 rounded-xl border-2 text-sm font-semibold transition ${reminderTimes[key]
                                                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                            : 'border-slate-200 bg-white text-slate-500'
                                                            }`}
                                                    >
                                                        <div>{label}</div>
                                                        <div className="text-xs font-normal mt-1 opacity-70">{time}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                                                Duration
                                            </label>
                                            <select
                                                value={durationDays}
                                                onChange={e => setDurationDays(Number(e.target.value))}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                            >
                                                <option value={3}>3 days</option>
                                                <option value={5}>5 days</option>
                                                <option value={7}>7 days</option>
                                                <option value={10}>10 days</option>
                                                <option value={14}>14 days</option>
                                                <option value={30}>30 days</option>
                                            </select>
                                        </div>

                                        {/* Error */}
                                        {reminderError && (
                                            <p className="text-sm text-rose-600 font-medium">
                                                ⚠️ {reminderError}
                                            </p>
                                        )}

                                        {/* Submit */}
                                        <button
                                            onClick={handleSetReminder}
                                            disabled={reminderLoading}
                                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl font-semibold transition"
                                        >
                                            {reminderLoading
                                                ? 'Setting reminder...'
                                                : `Set Reminder for ${durationDays} days`}
                                        </button>

                                        <p className="text-xs text-slate-400 text-center mt-3">
                                            You will receive an SMS confirmation immediately.
                                            Daily reminders will be sent at your selected times.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-400 text-center leading-relaxed break-inside-avoid mt-6">
                        This report is AI-assisted and must be verified by a licensed medical professional.
                        Prescripto is not a substitute for professional medical advice.
                    </p>
                </div>

                {/* Bottom print button */}
                <div className="no-print max-w-4xl mx-auto mt-6 flex justify-center">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow transition"
                    >
                        <Printer className="w-5 h-5" /> Print / Save as PDF
                    </button>
                </div>

            </div>
        </>
    );
};

export default Print;