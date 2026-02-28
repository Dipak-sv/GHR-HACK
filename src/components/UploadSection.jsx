import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, X } from 'lucide-react';

// Calls onFileSelected(File) immediately — no setTimeout, no internal mock.
// Parent Upload.jsx owns the loading state and API calls.
const UploadSection = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    setFile(selectedFile);
    onFileSelected(selectedFile); // pass raw File to parent immediately
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    onFileSelected(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-teal-600" />
        Upload Prescription
      </h2>

      {!file ? (
        <div
          className={`flex-1 relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[340px]
            ${isDragging
              ? 'border-teal-500 bg-teal-50 shadow-inner'
              : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-slate-100'
            }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
          />
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
            <UploadCloud className="w-10 h-10 text-teal-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-800 mb-2">
            Click to upload or drag & drop
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm text-center">
            JPG, PNG or WebP · Max 10MB
          </p>
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm pointer-events-none">
            Select a file
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 border border-teal-200 bg-teal-50 rounded-3xl min-h-[340px]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <FileImage className="w-8 h-8 text-teal-600" />
          </div>
          <p className="text-slate-800 font-semibold mb-1 text-center">{file.name}</p>
          <p className="text-slate-500 text-sm mb-6">
            {(file.size / 1024).toFixed(0)} KB · Ready to analyze
          </p>
          <button
            onClick={clearFile}
            className="px-5 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-white rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <X className="w-4 h-4" /> Remove &amp; choose another
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
