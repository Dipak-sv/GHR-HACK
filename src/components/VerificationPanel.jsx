import React, { useState } from 'react';
import { Edit2, Check, AlertCircle, RefreshCw } from 'lucide-react';
import ResultCard from './ResultCard';

const VerificationPanel = ({ initialData, onConfirm }) => {
  const [medicines, setMedicines] = useState(initialData || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedicines, setEditedMedicines] = useState(initialData || []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedMedicines(medicines); 
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setMedicines(editedMedicines);
    setIsEditing(false);
    onConfirm(editedMedicines);
  };

  const handleChange = (index, field, value) => {
    const updated = [...editedMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setEditedMedicines(updated);
  };

  const calculateOverallConfidence = () => {
    if (!medicines.length) return 0;
    const total = medicines.reduce((acc, curr) => acc + curr.confidence, 0);
    return Math.round(total / medicines.length);
  };

  const overallConfidence = calculateOverallConfidence();

  return (
    <div className="w-full flex w-full flex-col h-full bg-slate-50 border-l border-slate-200">
      <div className="p-6 border-b border-slate-200 bg-white shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Extracted Data</h2>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm border border-slate-200"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-sm text-sm"
              >
                <Check className="w-4 h-4" /> Confirm Changes
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 bg-teal-50/50 p-4 border border-teal-100 rounded-2xl">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-teal-100 shadow-sm shrink-0">
            <RefreshCw className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-teal-800 uppercase tracking-wide">AI Confidence Score</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-teal-600 font-mono tracking-tight">{overallConfidence}%</div>
              <p className="text-sm text-teal-700 font-medium">
                {overallConfidence > 85 ? 'High accuracy detected. Review recommended.' : 'Requires careful manual verification.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isEditing ? (
          medicines.map((med, idx) => (
            <ResultCard key={idx} medicine={med} />
          ))
        ) : (
          editedMedicines.map((med, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Medication {idx + 1}</h3>
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200">
                  Editing Mode
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicine Name</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleChange(idx, 'dosage', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Frequency</label>
                  <input
                    type="text"
                    value={med.frequency}
                    onChange={(e) => handleChange(idx, 'frequency', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleChange(idx, 'duration', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Instructions</label>
                  <textarea
                    value={med.instructions || ''}
                    onChange={(e) => handleChange(idx, 'instructions', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800 font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mt-4">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            <strong>Human Verification Required:</strong> AI extractions are predictions based on image analysis. A qualified medical professional or the patient themselves must carefully verify this information against the original prescription before acting upon it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;
