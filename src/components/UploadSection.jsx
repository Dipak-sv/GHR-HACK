import React, { useCallback, useState } from 'react';
import { UploadCloud, FileImage, CheckCircle, X } from 'lucide-react';

const UploadSection = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
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
      alert('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const imageUrl = URL.createObjectURL(selectedFile);
      onUploadSuccess(imageUrl);
    }, 2500);
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <UploadCloud className="w-6 h-6 text-teal-600" />
        Upload Prescription
      </h2>

      {!file ? (
        <div
          className={`flex-1 relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[400px]
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
            Click to upload or drag and drop
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm text-center">
            SVG, PNG or JPG. Ensure the text is clear.
          </p>
          <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm pointer-events-none">
            Select a file
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-10 border border-slate-200 bg-white rounded-3xl shadow-sm min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-4 border-teal-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                  <FileImage className="w-6 h-6" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-800 animate-pulse mb-1">
                  Analyzing Prescription...
                </h3>
                <p className="text-sm text-slate-500">
                  Running through MediParse OCR neural networks
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">
                Processing Complete
              </h3>
              <p className="text-slate-500 mb-6">
                Ready to review the extracted information.
              </p>
              <button
                onClick={clearFile}
                className="px-6 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Clear Image and Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
