import React from 'react';
import { ArrowRight, ShieldCheck, FileText, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const features = [
    {
      title: 'High Accuracy Parse',
      description: 'Advanced AI confidently decodes even the most difficult physician handwriting patterns.',
      icon: <Sparkles className="w-6 h-6 text-teal-600" />,
      color: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      title: 'Patient-Friendly Format',
      description: 'Converts complex clinical jargon into simple, actionable steps for medication adherence.',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Instant Results',
      description: 'Process prescription images in seconds with secure edge-optimized machine learning.',
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'Secure & Private',
      description: 'Enterprise-grade encryption ensures that patient health information remains completely private.',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="bg-white relative overflow-hidden">

      <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
        <div
          className="w-[1100px] h-[600px] mt-8 blur-2xl"
          style={{
            background: `
        radial-gradient(ellipse at center,
          rgba(20,184,166,0.4) 0%,
          rgba(59,130,246,0.25) 35%,
          rgba(99,102,241,0.15) 55%,
          transparent 75%)
      `
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 relative z-10">

        <div className="text-center max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4" />
            HIPAA Compliant AI Engine
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            Understand your <span className="text-teal-600">prescription</span> instantly.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-light">
            An Intelligent HealthTech solution that automatically interprets handwritten medical
            prescriptions and converts them into clear, simple digital information.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg shadow-teal-600/20"
            >
              Upload Prescription
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 bg-white rounded-2xl border ${feature.border} shadow-sm hover:shadow-md transition-shadow group cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Hero;