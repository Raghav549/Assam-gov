// ============================================
// GENERIC FILE UPLOAD COMPONENT
// ============================================

import React, { useState } from 'react';
import { FiUpload, FiFile, FiImage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FileUpload = ({ onFileSelect, accept = "image/*", label = "Upload File", maxFiles = 1 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Only ${maxFiles} file(s) allowed`);
      return;
    }
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    if (onFileSelect) onFileSelect(updatedFiles[updatedFiles.length - 1]); // Pass latest file
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFileSelect) onFileSelect(updatedFiles.length > 0 ? updatedFiles[updatedFiles.length - 1] : null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}
        `}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={handleChange}
        />
        
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-gray-100 rounded-full text-gray-400">
              <FiUpload className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center space-x-2 overflow-hidden">
                  {file.type.startsWith('image/') ? <FiImage className="text-blue-500 flex-shrink-0" /> : <FiFile className="text-gray-500 flex-shrink-0" />}
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
            {files.length < maxFiles && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); document.getElementById('file-input').click(); }}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                + Add another file
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
