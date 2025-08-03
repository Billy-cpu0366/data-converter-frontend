import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onRemoveFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`apple-card border-2 border-dashed transition-all duration-300 cursor-pointer
            ${isDragActive 
              ? 'border-apple-blue bg-apple-blue/5 dark:border-apple-blue dark:bg-apple-blue/10' 
              : 'border-apple-separator dark:border-apple-dark-separator hover:border-apple-blue dark:hover:border-apple-blue'
            }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept=".txt,.doc,.docx,.xls,.xlsx"
          />
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300
              ${isDragActive 
                ? 'bg-apple-blue/10 dark:bg-apple-blue/20' 
                : 'bg-apple-blue/5 dark:bg-apple-blue/10'
              }`}
            >
              <i className="fas fa-cloud-upload-alt text-apple-blue text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-apple-text dark:text-apple-dark-text mb-2"
            >
              拖拽文件到此处或点击上传
            </h3>
            <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary"
            >
              支持 .txt, .docx, .xlsx 等格式
            </p>
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="mt-4 apple-button px-4 py-2 bg-apple-blue text-white text-sm font-medium rounded-apple hover:bg-apple-blue/90 transition-colors"
            >
              选择文件
            </button>
          </div>
        </div>
      ) : (
        <div className="apple-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-apple-green/10 dark:bg-apple-green/20 rounded-xl flex items-center justify-center">
                <i className="fas fa-file-alt text-apple-green text-lg"></i>
              </div>
              <div>
                <p className="font-semibold text-apple-text dark:text-apple-dark-text"
                >{selectedFile.name}</p>
                <p className="text-sm text-apple-text-secondary dark:text-apple-dark-text-secondary"
                >
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveFile}
              className="apple-button p-2 text-apple-text-secondary hover:text-apple-red rounded-lg hover:bg-apple-red/10 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;