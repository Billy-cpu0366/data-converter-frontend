import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  showCursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = '',
  showCursor = true
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      }
    }, isPaused ? pauseTime : isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className={`${className} ${showCursor ? 'typewriter-cursor' : ''} relative`}>
      <span className="relative z-10">{currentText}</span>
      {showCursor && (
        <span className="inline-block w-1 h-8 bg-gradient-to-t from-cyan-400 to-purple-500 ml-1 animate-pulse shadow-lg shadow-cyan-400/50"></span>
      )}
      {/* 发光效果 */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 blur-sm"
        style={{
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text'
        }}
      >
        {currentText}
      </span>
    </span>
  );
};

export default TypewriterText;
