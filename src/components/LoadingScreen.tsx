import React, { useState, useEffect, useMemo } from 'react';
import ParticleBackground from './ParticleBackground';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('');


  const loadingTexts = useMemo(() => [
    '初始化量子引擎...',
    '加载神经网络...',
    '启动粒子系统...',
    '连接数据矩阵...',
    '激活视觉特效...',
    '准备就绪！'
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 20 + 10; // 加快进度

        // 更新加载文本
        const textIndex = Math.floor((newProgress / 100) * loadingTexts.length);
        if (textIndex < loadingTexts.length) {
          setCurrentText(loadingTexts[textIndex]);
        }

        if (newProgress >= 100) {
          setTimeout(() => {
            onComplete();
          }, 500); // 减少延迟时间
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 150); // 更快的更新频率

    return () => clearInterval(interval);
  }, [onComplete, loadingTexts]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      {/* 粒子背景 - 与主页面保持一致 */}
      <ParticleBackground />

      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 扫描线 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
              style={{
                top: `${i * 5}%`,
                left: 0,
                right: 0,
                animation: `scan ${2 + i * 0.1}s linear infinite`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* 粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              NEXUS
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-cyan-300 text-xl mt-2 font-light">CONVERTER</p>
        </div>

        {/* 进度环 */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* 背景环 */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* 进度环 */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00FFFF" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* 进度数字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* 加载文本 */}
        <div className="h-8 mb-4">
          <p className="text-cyan-300 text-lg font-mono animate-pulse">
            {currentText}
          </p>
        </div>

        {/* 进度条 */}
        <div className="w-80 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 底部提示 */}
        <p className="text-gray-400 text-sm mt-8 animate-pulse">
          正在加载超级炫酷的数据转换体验...
        </p>
      </div>


    </div>
  );
};

export default LoadingScreen;
