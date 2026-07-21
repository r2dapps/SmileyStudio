import React, { useEffect, useRef } from 'react';

interface Props {
  note: string;
  cents: number;
}

export const PitchMeterCanvas: React.FC<Props> = ({ note, cents }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height - 20;
    const radius = Math.min(canvas.width / 2 - 20, canvas.height - 40);

    // Draw Arc Gauge Background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Draw Tuning Target Zone (-10c to +10c)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI + (40 / 100) * Math.PI, Math.PI + (60 / 100) * Math.PI);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#10b981'; // Emerald target zone
    ctx.stroke();

    // Calculate Needle Angle (-50c to +50c)
    const normalizedCents = Math.max(-50, Math.min(50, cents));
    const angle = Math.PI + ((normalizedCents + 50) / 100) * Math.PI;

    // Draw Needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + (radius - 10) * Math.cos(angle), centerY + (radius - 10) * Math.sin(angle));
    ctx.lineWidth = 4;
    ctx.strokeStyle = Math.abs(cents) <= 10 ? '#10b981' : '#ec4899';
    ctx.stroke();

    // Needle Hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ec4899';
    ctx.fill();
  }, [note, cents]);

  return <canvas ref={canvasRef} className="w-full h-44" />;
};
