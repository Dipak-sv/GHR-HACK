import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, ShieldCheck } from 'lucide-react';

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
    const {
        extractedData,
        safetyAnalysis,
        summary,
        simplifiedText,
        language,
        confirmedAt,
    } = location.state || {};

    // ── Guard ────────────────────────────────────────────────
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

    return (
        <>
            {/* ── Print-specific CSS ── */}
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { box-shadow: none !important; border: none !important; margin: 0 !important; }
        }
      `}</style>

            <div className="min-h-screen bg-slate-100 no-print-bg py-8 px-4">
                {/* ── Navigation bar (hidden on print) ── */}
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
                            <h1 className="text-2xl font-bold text-teal-700 tracking-tight">MediScript AI</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Intelligent Prescription Interpretation System</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Confirmed on</p>
                            <p className="text-sm font-semibold text-slate-600">{printDate}</p>
                            <p className="text-xs text-slate-400 mt-1">Language: {language || 'English'}</p>
                        </div>
                    </div>

                    {/* Patient info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className={`flex items-center justify-between rounded-2xl border p-4 ${riskColor}`}>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Safety Analysis</p>
                            <p className="text-2xl font-bold">{summary.safety?.display || `${safetyAnalysis?.safetyScore}/100`}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p>{summary.safety?.criticalCount ?? 0} critical issue(s)</p>
                            <p>{summary.safety?.warningCount ?? 0} warning(s)</p>
                        </div>
                    </div>

                    {/* Safety flags */}
                    {flags.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-600">Safety Flags</p>
                            {flags.map((f, i) => (
                                <div
                                    key={i}
                                    className={`flex items-start gap-2 rounded-xl border p-3 text-sm
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

                    {/* Medicines table */}
                    <div>
                        <p className="text-sm font-semibold text-slate-600 mb-3">
                            Medicines ({medicines.length})
                        </p>
                        <div className="space-y-3">
                            {medicines.map((med, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                                >
                                    {/* Name + type */}
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="font-bold text-slate-800">{med.name || '—'}</p>
                                        <span className="text-xs font-medium text-slate-500 capitalize">{med.type || 'tablet'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Dosage</p>
                                        <p className="text-sm text-slate-800 font-medium">{med.dosage || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Frequency</p>
                                        <p className="text-sm text-slate-800 font-medium">{med.frequency || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Timing / Duration</p>
                                        <p className="text-sm text-slate-800 font-medium">
                                            {med.timing || '—'}{med.duration ? ` · ${med.duration}` : ''}
                                        </p>
                                    </div>
                                    {/* Confidence badge - inline, col-span-4 on mobile */}
                                    <div className="col-span-2 md:col-span-4 flex items-center gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CONF_COLOR[med.confidence] || CONF_COLOR.medium}`}>
                                            {med.confidence} confidence
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Simplified instructions */}
                    {simplifiedText && (
                        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                            <p className="text-sm font-semibold text-teal-700 mb-2">
                                Patient Instructions ({language})
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                {simplifiedText}
                            </p>
                        </div>
                    )}

                    {/* Human-verified stamp */}
                    <div className="flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl py-5">
                        <ShieldCheck className="w-8 h-8 text-emerald-600" />
                        <div>
                            <p className="text-lg font-bold text-emerald-800">Human Verified ✓</p>
                            <p className="text-sm text-emerald-600">
                                Reviewed and confirmed by a qualified person on {printDate}
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                        This report is AI-assisted and must be verified by a licensed medical professional.
                        MediScript AI is not a substitute for professional medical advice.
                    </p>

                </div>

                {/* Bottom print button (hidden on print) */}
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
