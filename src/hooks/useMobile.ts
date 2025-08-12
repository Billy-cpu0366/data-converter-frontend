import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

export const useMobile = (): MobileDetection => {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'landscape',
    isTouchDevice: false,
  });

  useEffect(() => {
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const orientation = height > width ? 'portrait' : 'landscape';
      
      // 检测触摸设备
      const isTouchDevice = 'ontouchstart' in window || 
                           navigator.maxTouchPoints > 0 || 
                           (navigator as any).msMaxTouchPoints > 0;

      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isTouchDevice,
      });
    };

    // 初始检测
    updateDetection();

    // 监听窗口大小变化
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
};

// 移动端优化的样式类
export const getMobileClasses = (detection: MobileDetection) => {
  const { isMobile, isTablet, orientation } = detection;
  
  return {
    // 容器类
    container: isMobile 
      ? 'px-4 py-6' 
      : isTablet 
        ? 'px-6 py-8' 
        : 'px-8 py-12',
    
    // 文字大小
    title: isMobile 
      ? 'text-2xl sm:text-3xl' 
      : isTablet 
        ? 'text-4xl' 
        : 'text-5xl lg:text-6xl',
    
    subtitle: isMobile 
      ? 'text-lg' 
      : isTablet 
        ? 'text-xl' 
        : 'text-2xl',
    
    body: isMobile 
      ? 'text-base' 
      : 'text-lg',
    
    // 按钮大小
    button: isMobile 
      ? 'px-6 py-4 text-base min-h-[48px]' 
      : isTablet 
        ? 'px-8 py-3 text-lg' 
        : 'px-10 py-4 text-xl',
    
    // 卡片间距
    card: isMobile 
      ? 'p-4 rounded-xl' 
      : isTablet 
        ? 'p-6 rounded-2xl' 
        : 'p-8 rounded-3xl',
    
    // 网格布局
    grid: isMobile 
      ? 'grid-cols-1 gap-4' 
      : isTablet 
        ? 'grid-cols-2 gap-6' 
        : 'grid-cols-3 lg:grid-cols-4 gap-8',
    
    // 上传区域
    uploadArea: isMobile 
      ? orientation === 'portrait' 
        ? 'min-h-[250px] p-4' 
        : 'min-h-[180px] p-3'
      : isTablet 
        ? 'min-h-[300px] p-6' 
        : 'min-h-[350px] p-8',
  };
};

// 移动端优化的动画配置
export const getMobileAnimations = (detection: MobileDetection) => {
  const { isMobile, isTouchDevice } = detection;
  
  // 移动端减少动画以提升性能
  return {
    duration: isMobile ? 'duration-200' : 'duration-300',
    scale: isTouchDevice ? 'active:scale-95' : 'hover:scale-105',
    transition: isMobile ? 'transition-all duration-200' : 'transition-all duration-300',
    // 移动端禁用悬停效果
    hover: isTouchDevice ? '' : 'hover:shadow-lg hover:shadow-cyan-400/20',
  };
};
