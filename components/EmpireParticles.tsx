import React, { useLayoutEffect, useRef } from 'react';

/**
 * Empire Cosmos Particles v7.1 (Production & TS Safe)
 * Features:
 * - Sync render with useLayoutEffect
 * - Retina/High-DPI sharp scaling
 * - Gravitational mouse attraction
 * - Optimized trail visibility
 */
const EmpireParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina Sharp Scaling Logic
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      pulse: number;
    }> = [];

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];
    const count = Math.min(120, Math.floor(window.innerWidth / 10));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;
    const animate = () => {
      // Trail Effect: rgba(2, 6, 23, 0.08) for optimal deep blue visibility
      ctx.fillStyle = 'rgba(2, 6, 23, 0.08)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        // Gravitational Attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 250 && dist > 0) {
          const force = (250 - dist) / 250;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }

        // Physics
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        // Wrapping
        p.x = (p.x + window.innerWidth) % window.innerWidth;
        p.y = (p.y + window.innerHeight) % window.innerHeight;

        // Size & Pulse
        const dynamicPulse = Math.sin(p.pulse) * 0.8;
        let rawSize = p.radius + dynamicPulse;
        if (!isFinite(rawSize) || rawSize <= 0) rawSize = p.radius;
        const size = Math.max(1, Math.abs(rawSize));

        // Drawing
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // High visibility alpha values
        ctx.globalAlpha = dist < 180 ? 0.9 : 0.6;
        ctx.shadowBlur = dist < 180 ? 20 : 8;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] bg-[#020617]"
      aria-hidden="true"
    />
  );
};

export default EmpireParticles;