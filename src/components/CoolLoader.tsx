import React from 'react';

interface CoolLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  type?: 'spinner' | 'dots' | 'pulse' | 'wave';
  text?: string;
}

const CoolLoader: React.FC<CoolLoaderProps> = ({ 
  size = 'md', 
  type = 'spinner',
  text = '加载中...'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const SpinnerLoader = () => (
    <div className="relative mx-auto" style={{ width: sizeClasses[size].split(' ')[0], height: sizeClasses[size].split(' ')[1] }}>
      {/* 外环 */}
      <div className={`absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-purple-500 rounded-full animate-spin`}></div>
      {/* 中环 */}
      <div className={`absolute inset-2 border-3 border-transparent border-t-purple-400 border-r-pink-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      {/* 内环 */}
      <div className={`absolute inset-4 border-2 border-transparent border-t-pink-400 border-r-cyan-500 rounded-full animate-spin`} style={{ animationDuration: '2s' }}></div>
      {/* 中心点 */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
    </div>
  );

  const DotsLoader = () => (
    <div className="flex space-x-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}
                     relative`}
          style={{
            animationDelay: `${i * 0.2}s`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-ping opacity-30"></div>
        </div>
      ))}
    </div>
  );

  const PulseLoader = () => (
    <div className="relative mx-auto" style={{ width: sizeClasses[size].split(' ')[0], height: sizeClasses[size].split(' ')[1] }}>
      {/* 外层脉冲 */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-ping opacity-40"></div>
      {/* 中层脉冲 */}
      <div className="absolute inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
      {/* 内核 */}
      <div className="absolute inset-2 bg-gradient-to-r from-pink-400 to-cyan-500 rounded-full animate-pulse"></div>
    </div>
  );

  const WaveLoader = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2' : size === 'md' ? 'w-3' : 'w-4'}
                     bg-gradient-to-t from-cyan-400 via-purple-500 to-pink-400 rounded-full relative overflow-hidden wave-bounce`}
          style={{
            height: size === 'sm' ? '20px' : size === 'md' ? '30px' : '40px',
            animationDelay: `${i * 0.1}s`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30 animate-pulse"></div>
        </div>
      ))}

    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'wave':
        return <WaveLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <p className="text-apple-text-secondary dark:text-apple-dark-text-secondary text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default CoolLoader;
