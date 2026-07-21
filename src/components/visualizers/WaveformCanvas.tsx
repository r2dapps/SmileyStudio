import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../audio/engine';
import { useStudioStore } from '../../store/useStudioStore';

export const WaveformCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isMicActive = useStudioStore((state) => state.isMicActive);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      animFrameId = requestAnimationFrame(render);
      const analyser = audioEngine.getAnalyser();

      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      if (!analyser || !isMicActive) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `hsl(${i * 2 + 300}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isMicActive]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
