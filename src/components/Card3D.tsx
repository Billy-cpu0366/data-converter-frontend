import React, { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowEffect?: boolean;
}

const Card3D: React.FC<Card3DProps> = ({ 
  children, 
  className = '', 
  intensity = 1,
  glowEffect = true 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const getTransform = () => {
    if (!isHovered) return 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    
    const maxRotation = 15 * intensity;
    const rotateY = (mousePosition.x / 200) * maxRotation;
    const rotateX = -(mousePosition.y / 200) * maxRotation;
    const translateZ = 20 * intensity;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
  };

  const getGlowStyle = () => {
    if (!glowEffect || !isHovered) return {};
    
    const glowIntensity = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2) / 100;
    return {
      boxShadow: `0 0 ${20 + glowIntensity * 10}px rgba(0, 122, 255, ${0.3 + glowIntensity * 0.2})`
    };
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d transition-all duration-300 ease-out ${className}`}
      style={{
        transform: getTransform(),
        transformStyle: 'preserve-3d',
        ...getGlowStyle()
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full">
        {children}
        
        {/* 光泽效果 */}
        {glowEffect && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none rounded-inherit"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x + 200}px ${mousePosition.y + 200}px, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              borderRadius: 'inherit'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Card3D;
