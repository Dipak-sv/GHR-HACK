import React from 'react';
import { Pill, Calendar, Clock, Activity, ShieldAlert } from 'lucide-react';

const ResultCard = ({ medicine }) => {
  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (score >= 70) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-rose-700 bg-rose-100 border-rose-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(medicine.confidence)}`}>
        {medicine.confidence}% Confidence
      </div>

      <div className="flex items-start gap-4 mb-5 mt-2">
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 flex-shrink-0">
          <Pill className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{medicine.name}</h3>
          <p className="text-slate-500 font-medium text-sm">{medicine.type || 'Tablet'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block flex items-center gap-1">
              <Activity className="w-3 h-3" /> Dosage
            </span>
            <span className="text-sm font-medium text-slate-800">{medicine.dosage}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block flex items-center gap-1">
              <Clock className="w-3 h-3" /> Frequency
            </span>
            <span className="text-sm font-medium text-slate-800">{medicine.frequency}</span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2">
          <div className="flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Duration
            </span>
            <span className="text-sm font-medium text-slate-800">{medicine.duration}</span>
          </div>
        </div>
      </div>

      {medicine.instructions && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-2 text-sm text-teal-800 bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-600" />
            <p className="font-medium leading-relaxed">{medicine.instructions}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
