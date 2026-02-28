import React, { useState } from 'react';
import UploadSection from '../components/UploadSection';
import { Shield, Lock, Globe, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadPrescription, simplifyPrescription } from '../services/api';

const LANGUAGES = [
  { value: 'english', label: '🇬🇧 English' },
  { value: 'hindi', label: '🇮🇳 Hindi (हिंदी)' },
  { value: 'marathi', label: '🇮🇳 Marathi (मराठी)' },
];

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [language, setLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // UploadSection calls this with raw File object
  const handleFileSelected = (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      setImageUrl(null);
      return;
    }
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file || isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      // Step 1 — Upload to Groq Vision AI
      const uploadResult = await uploadPrescription(file);

      // Step 2 — Get simplified patient instructions
      const simplifyResult = await simplifyPrescription(uploadResult.sessionId, language);

      // Step 3 — Navigate to verification with full state
      navigate('/verification', {
        state: {
          sessionId: uploadResult.sessionId,
          extractedData: uploadResult.extractedData,
          safetyAnalysis: uploadResult.safetyAnalysis,
          summary: uploadResult.summary,
          simplifiedText: simplifyResult.simplifiedText,
          language,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to analyze prescription. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 flex flex-col">
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[700px] flex flex-col lg:flex-row">

          {/* ── LEFT: File drop ──────────────────────────────── */}
          <div className="w-full lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50">
            <UploadSection onFileSelected={handleFileSelected} />
          </div>

          {/* ── RIGHT: Options + action ──────────────────────── */}
          <div className="w-full lg:w-7/12 flex flex-col p-8">

            {/* ── Image preview (shown once file is selected) ── */}
            {imageUrl && !isLoading && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 max-h-64">
                <img
                  src={imageUrl}
                  alt="Prescription preview"
                  className="w-full h-full object-contain bg-slate-100"
                />
              </div>
            )}

            {/* ── Loading state ─────────────────────────────── */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-teal-100 rounded-full animate-pulse" />
                  <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Reading prescription…
                </h3>
                <p className="text-slate-500 max-w-xs">
                  Groq AI is extracting medicine data. This may take 10–15 seconds.
                </p>
              </div>
            )}

            {/* ── Error ─────────────────────────────────────── */}
            {error && !isLoading && (
              <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* ── Idle / ready state ────────────────────────── */}
            {!isLoading && (
              <div className="flex-1 flex flex-col justify-center space-y-6">

                {/* Language selector */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    <Globe className="w-4 h-4" /> Report Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Patient instructions will be generated in this language
                  </p>
                </div>

                {/* Analyze button */}
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isLoading}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all shadow-sm
                    ${file
                      ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {file ? '🔬 Analyze Prescription' : 'Select a prescription image first'}
                </button>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 opacity-70">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="text-xs text-slate-500 font-medium">Image deleted after analysis</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <Lock className="w-5 h-5 text-teal-600" />
                    <span className="text-xs text-slate-500 font-medium">Session expires in 24h</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-lg">🤖</span>
                    <span className="text-xs text-slate-500 font-medium">Groq Llama Vision AI</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Upload;