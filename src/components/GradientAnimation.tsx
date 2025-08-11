import React from 'react';

interface GradientAnimationProps {
  children: React.ReactNode;
  colors?: string[];
  duration?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  className?: string;
  type?: 'background' | 'text' | 'border';
}

const GradientAnimation: React.FC<GradientAnimationProps> = ({
  children,
  colors = ['#007AFF', '#AF52DE', '#5AC8FA', '#FF2D92'],
  duration = 8,
  direction = 'diagonal',
  className = '',
  type = 'background'
}) => {
  const getGradientDirection = () => {
    switch (direction) {
      case 'horizontal':
        return '90deg';
      case 'vertical':
        return '0deg';
      case 'diagonal':
      default:
        return '-45deg';
    }
  };

  const gradientStyle = {
    background: `linear-gradient(${getGradientDirection()}, ${colors.join(', ')})`,
    backgroundSize: '400% 400%',
    animation: `gradientShift ${duration}s ease infinite`
  };

  const textGradientStyle = {
    background: `linear-gradient(${getGradientDirection()}, ${colors.join(', ')})`,
    backgroundSize: '400% 400%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    animation: `gradientShift ${duration}s ease infinite`
  };

  const borderGradientStyle = {
    background: `linear-gradient(${getGradientDirection()}, ${colors.join(', ')})`,
    backgroundSize: '400% 400%',
    animation: `gradientShift ${duration}s ease infinite`,
    padding: '2px',
    borderRadius: 'inherit'
  };

  if (type === 'text') {
    return (
      <span className={className} style={textGradientStyle}>
        {children}
      </span>
    );
  }

  if (type === 'border') {
    return (
      <div className={className} style={borderGradientStyle}>
        <div className="bg-apple-bg dark:bg-apple-dark-bg w-full h-full rounded-inherit">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={gradientStyle}>
      {children}
    </div>
  );
};

export default GradientAnimation;
