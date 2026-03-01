import React, { useState } from 'react';
import { Edit2, Check, AlertCircle, RefreshCw } from 'lucide-react';

// confidence is a string: "high" | "medium" | "low"
const CONF_COLOR = {
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100   text-amber-700   border-amber-200',
  low: 'bg-rose-100    text-rose-700    border-rose-200',
};

// Map string confidence to a display percentage for readability
const CONF_PCT = { high: 95, medium: 70, low: 40 };

const MedicineCard = ({ medicine }) => {
  const confColor = CONF_COLOR[medicine.confidence] || CONF_COLOR.medium;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-slate-800 text-base">{medicine.name || '—'}</p>
          <span className="text-xs font-medium text-slate-500 capitalize">
            {medicine.type || 'tablet'}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${confColor}`}>
          {medicine.confidence || 'medium'} confidence
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Dosage</p>
          <p className="text-slate-700 font-medium">{medicine.dosage || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Frequency</p>
          <p className="text-slate-700 font-medium">{medicine.frequency || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Timing</p>
          <p className="text-slate-700 font-medium">{medicine.timing || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Duration</p>
          <p className="text-slate-700 font-medium">{medicine.duration || 'As directed'}</p>
        </div>
      </div>
    </div>
  );
};

const VerificationPanel = ({ initialData, onConfirm, isConfirming }) => {
  const [medicines, setMedicines] = useState(initialData || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedicines, setEditedMedicines] = useState(initialData || []);

  // Sync state when language changes (initialData updates)
  React.useEffect(() => {
    setMedicines(initialData || []);
    setEditedMedicines(initialData || []);
  }, [initialData]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel — revert edits
      setEditedMedicines(medicines);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setMedicines(editedMedicines);
    setIsEditing(false);
    onConfirm(editedMedicines);
  };

  const handleConfirmNoEdit = () => {
    onConfirm(medicines);
  };

  const handleChange = (index, field, value) => {
    const updated = [...editedMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setEditedMedicines(updated);
  };

  // Safe confidence stats — works with string values
  const lowCount = medicines.filter(m => m.confidence === 'low').length;
  const highCount = medicines.filter(m => m.confidence === 'high').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col">

      {/* Header */}
      <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            Verify Medicines ({medicines.length})
          </h2>
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition text-sm border border-slate-200"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={handleConfirmNoEdit}
                  disabled={isConfirming}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl font-medium transition text-sm shadow-sm"
                >
                  {isConfirming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    <><Check className="w-4 h-4" /> Confirm</>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-medium transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isConfirming}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl font-medium transition shadow-sm text-sm"
                >
                  <Check className="w-4 h-4" /> Confirm Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Confidence summary */}
        <div className="flex items-center gap-4 bg-teal-50 p-4 border border-teal-100 rounded-2xl">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-teal-100 shadow-sm shrink-0">
            <RefreshCw className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-sm text-teal-800">
            <p className="font-semibold">
              {highCount} high · {medicines.length - highCount - lowCount} medium · {lowCount} low confidence
            </p>
            <p className="opacity-70">
              {lowCount > 0
                ? `${lowCount} medicine(s) need careful verification`
                : 'All medicines extracted with good confidence'}
            </p>
          </div>
        </div>
      </div>

      {/* Medicine cards / edit forms */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!isEditing ? (
          medicines.map((med, idx) => (
            <MedicineCard key={idx} medicine={med} />
          ))
        ) : (
          editedMedicines.map((med, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Medicine {idx + 1}</h3>
                <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200">
                  Editing
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { field: 'name', label: 'Medicine Name' },
                  { field: 'type', label: 'Type (tablet/syrup…)' },
                  { field: 'dosage', label: 'Dosage' },
                  { field: 'frequency', label: 'Frequency' },
                  { field: 'timing', label: 'Timing (before/after food)' },
                  { field: 'duration', label: 'Duration' },
                ].map(({ field, label }) => (
                  <div key={field} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={med[field] || ''}
                      onChange={(e) => handleChange(idx, field, e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800 font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Human verification notice */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            <strong>Human Verification Required:</strong> AI extractions are predictions. A qualified person must verify all medicines against the original prescription before acting on this information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;
