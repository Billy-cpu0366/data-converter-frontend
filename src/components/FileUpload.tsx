import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, onRemoveFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleClick = (e: React.MouseEvent) => {
    console.log('handleClick triggered', e.target);
    // 如果点击的不是按钮，则触发文件选择
    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
      console.log('File input ref:', fileInputRef.current);
      fileInputRef.current?.click();
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
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 主上传区域 */}
      <div className="lg:col-span-2">
        {!selectedFile ? (
          <div
            className={`relative border-2 border-dashed transition-all duration-500 cursor-pointer group overflow-hidden rounded-2xl min-h-[320px] flex items-center justify-center
              ${isDragActive
                ? 'border-cyan-400 bg-cyan-400/5 scale-[1.02] shadow-2xl shadow-cyan-400/20'
                : 'border-gray-300/30 dark:border-gray-600/30 hover:border-cyan-400/50 dark:hover:border-cyan-400/50 hover:scale-[1.01] hover:shadow-xl hover:shadow-cyan-400/10'
              }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleFileChange}
            accept=".txt,.doc,.docx,.xls,.xlsx"
          />

            {/* 动态背景效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/3 via-blue-400/3 to-purple-400/3"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]"></div>
            </div>

            {/* 主要内容区域 */}
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-8">
              {/* 现代化图标设计 */}
              <div className={`relative w-24 h-24 mb-6 transition-all duration-700 transform
                ${isDragActive
                  ? 'scale-110'
                  : 'group-hover:scale-105'
                }`}
              >
                {/* 外层光环 */}
                <div className={`absolute inset-0 rounded-full transition-all duration-700
                  ${isDragActive
                    ? 'bg-gradient-to-r from-cyan-400/30 to-blue-500/30 animate-pulse'
                    : 'bg-gradient-to-r from-gray-200/20 to-gray-300/20 group-hover:from-cyan-400/20 group-hover:to-blue-500/20'
                  }`}></div>

                {/* 中层圆环 */}
                <div className={`absolute inset-2 rounded-full border-2 transition-all duration-700
                  ${isDragActive
                    ? 'border-cyan-400/60 bg-cyan-400/10'
                    : 'border-gray-300/40 bg-gray-100/30 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10'
                  }`}></div>

                {/* 内层图标容器 */}
                <div className={`absolute inset-4 rounded-full flex items-center justify-center transition-all duration-700
                  ${isDragActive
                    ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20'
                    : 'bg-gradient-to-br from-gray-100/50 to-gray-200/50 group-hover:from-cyan-400/15 group-hover:to-blue-500/15'
                  }`}
                >
                  {/* 主图标 */}
                  <div className="relative">
                    {/* 云朵图标 */}
                    <svg
                      className={`w-8 h-8 transition-all duration-700 transform
                        ${isDragActive
                          ? 'text-cyan-400 animate-bounce'
                          : 'text-gray-500 group-hover:text-cyan-400 group-hover:scale-110'
                        }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                    </svg>

                    {/* 上传箭头 */}
                    <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 transition-all duration-700
                      ${isDragActive
                        ? 'text-cyan-300 animate-pulse'
                        : 'text-gray-400 group-hover:text-cyan-300 group-hover:-translate-y-1'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 动态粒子效果 */}
                {isDragActive && (
                  <>
                    <div className="absolute top-2 right-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-1/2 right-1 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  </>
                )}
              </div>

              {/* 主标题 */}
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {isDragActive ? '释放文件开始上传' : '拖拽文件或点击上传'}
              </h2>

              {/* 副标题 */}
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                支持多种格式，快速转换处理
              </p>
              {/* 行动按钮 */}
              <button
                type="button"
                onClick={(e) => {
                  console.log('Button clicked!', e);
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('File input ref from button:', fileInputRef.current);
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                    console.log('File input clicked via ref');
                  } else {
                    console.error('File input ref not found!');
                  }
                }}
                style={{
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto'
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-400/30 active:scale-95 relative overflow-hidden group"
              >
                {/* 按钮光效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>

                <span className="relative z-10 flex items-center gap-3">
                  <i className="fas fa-folder-open"></i>
                  浏览文件
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-500 animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <i className="fas fa-file-alt text-green-400 text-xl relative z-10"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{selectedFile.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={onRemoveFile}
                className="p-3 text-gray-400 hover:text-red-400 rounded-xl hover:bg-red-400/10 transition-all duration-300 transform hover:scale-110 active:scale-95"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 侧边栏信息 */}
      <div className="lg:col-span-1">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-cyan-400"></i>
            支持格式
          </h3>

          <div className="space-y-3">
            {/* Word 文档 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100/50 dark:border-blue-800/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">Word 文档</p>
                <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">.doc, .docx</p>
              </div>
            </div>

            {/* Excel 表格 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100/50 dark:border-green-800/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12V14H16V12H8M8,16V18H13V16H8M8,8V10H16V8H8Z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">Excel 表格</p>
                <p className="text-green-600 dark:text-green-400 text-xs font-medium">.xls, .xlsx</p>
              </div>
            </div>

            {/* 文本文件 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-100/50 dark:border-gray-700/30 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-gray-500/25 transition-all duration-300">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12V14H16V12H8M8,16V18H16V16H8Z"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">文本文件</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">.txt</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <i className="fas fa-magic text-purple-400"></i>
              功能特性
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400 text-xs"></i>
                智能格式识别
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400 text-xs"></i>
                快速批量处理
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400 text-xs"></i>
                保持原始格式
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-green-400 text-xs"></i>
                安全可靠转换
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;