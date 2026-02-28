import React, { useState } from 'react';
import UploadSection from '../components/UploadSection';
import VerificationPanel from '../components/VerificationPanel';
import { Shield, Lock, FileText, Share2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("upload");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
  const [verifiedData, setVerifiedData] = useState([]);

  const mockExtractedData = [
    {
      name: 'Amoxicillin',
      type: 'Capsule',
      dosage: '500mg',
      frequency: '1 capsule every 8 hours',
      duration: '7 Days',
      confidence: 94,
      instructions: 'Take precisely every 8 hours. Complete the full course even if feeling better.',
    },
    {
      name: 'Ibuprofen',
      type: 'Tablet',
      dosage: '400mg',
      frequency: '1 tablet as needed',
      duration: 'Up to 5 Days',
      confidence: 98,
      instructions: 'Take only when necessary. Maximum 3 tablets per 24 hours.',
    }
  ];

  const handleUploadSuccess = (imageUrl) => {
    setUploadedImage(imageUrl);
    setStep("processing");

    // Simulate AI Processing
    setTimeout(() => {
      setExtractedData(mockExtractedData);
      setStep("verification");
    }, 2000);
  };

  const handleConfirmData = (data) => {
    setVerifiedData(data);
    setStep("confirmed");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 flex flex-col">
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[750px] flex flex-col lg:flex-row">

          {/* LEFT PANEL */}
          <div className="w-full lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50">
            
            {step === "upload" && (
              <UploadSection onUploadSuccess={handleUploadSuccess} />
            )}

            {step !== "upload" && uploadedImage && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                    Prescription Source
                  </h2>
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setStep("upload");
                    }}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-colors"
                  >
                    Upload New
                  </button>
                </div>

                <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-300 overflow-hidden">
                  <img
                    src={uploadedImage}
                    alt="Prescription preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-7/12 flex flex-col h-[750px] lg:h-auto">

            {step === "upload" && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                <FileText className="w-10 h-10 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  Awaiting Image
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Upload a prescription image to begin AI extraction.
                </p>
              </div>
            )}

            {step === "processing" && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  AI is analyzing your prescription...
                </h3>
                <p className="text-slate-500">
                  Extracting medicines and generating structured output.
                </p>
              </div>
            )}

            {step === "verification" && (
              <VerificationPanel
                initialData={extractedData}
                onConfirm={handleConfirmData}
              />
            )}

            {step === "confirmed" && (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                <Shield className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-2xl font-bold text-emerald-800 mb-2">
                  Verification Complete
                </h3>
                <p className="text-emerald-700 mb-6">
                  Prescription has been confirmed successfully.
                </p>

                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition-colors shadow-sm">
                    <Share2 className="w-4 h-4" /> Share Summary
                  </button>

                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Lock className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              End-to-End Encrypted Data
            </span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Shield className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-600">
              HIPAA Compliant Processing
            </span>
          </div>
          <div className="flex items-center gap-3 justify-center md:justify-end">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">
              Secure Cloud Edge Node
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Upload;