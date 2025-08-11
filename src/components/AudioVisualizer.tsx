import React, { useEffect, useRef, useState } from 'react';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    // 创建虚拟音频数据
    const createAudioData = () => {
      const dataArray = new Array(128);
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = Math.random() * 255;
      }
      return dataArray;
    };

    const draw = () => {
      if (!isPlaying) return;

      const dataArray = createAudioData();
      const barWidth = canvas.width / dataArray.length;
      
      // 清除画布
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制频谱条
      dataArray.forEach((value, index) => {
        const barHeight = (value / 255) * canvas.height * 0.8;
        const x = index * barWidth;
        const y = canvas.height - barHeight;

        // 创建渐变
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, `hsl(${(index * 2) % 360}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${(index * 2 + 60) % 360}, 100%, 70%)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 1, barHeight);

        // 添加发光效果
        ctx.shadowColor = `hsl(${(index * 2) % 360}, 100%, 50%)`;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isPlaying) {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-32 bg-black/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-cyan-500/25"
        >
          {isPlaying ? '⏸️ 暂停音效' : '🎵 启动音效'}
        </button>
      </div>
      {isPlaying && (
        <div className="absolute top-2 left-2 text-cyan-400 text-xs font-mono">
          🎶 音频可视化激活
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;
