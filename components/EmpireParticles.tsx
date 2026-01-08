
import React, { useLayoutEffect, useRef } from 'react';

/**
 * Empire Cosmos Particles v10.1.0 (Production Ultra Build)
 * Optimized for WOW factor and high-fidelity glow trails.
 */
const EmpireParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#ffffff'];
    // Higher count for production WOW effect
    const count = Math.min(180, Math.floor(window.innerWidth / 8));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        radius: Math.random() * 3 + 1, 
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;
    const animate = () => {
      // Clear with slight trail
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        // Stronger Attraction Gravitacional
        if (dist < 500 && dist > 0) {
          const force = (500 - dist) / 500;
          p.vx += (dx / dist) * force * 0.22;
          p.vy += (dy / dist) * force * 0.22;
        }

        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.05;

        // Wrap boundaries
        p.x = (p.x + window.innerWidth) % window.innerWidth;
        p.y = (p.y + window.innerHeight) % window.innerHeight;

        const dynamicPulse = Math.sin(p.pulse) * 2.0;
        let calculatedSize = p.radius + dynamicPulse;
        
        if (!Number.isFinite(calculatedSize) || calculatedSize <= 0.2) {
            calculatedSize = 0.5;
        }
        const size = Math.abs(calculatedSize);

        try {
            ctx.beginPath();
            const drawX = Number.isFinite(p.x) ? p.x : 0;
            const drawY = Number.isFinite(p.y) ? p.y : 0;
            
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            
            // Ultra Glow Trail
            if (dist < 300) {
               ctx.globalAlpha = 1.0;
               ctx.shadowBlur = 35;
               ctx.shadowColor = p.color;
            } else {
               ctx.globalAlpha = 0.5;
               ctx.shadowBlur = 10;
               ctx.shadowColor = p.color;
            }
            
            ctx.fill();
        } catch (err) {}
        
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
      className="fixed inset-0 pointer-events-none z-[-1] bg-[#020617] particle-canvas"
      aria-hidden="true"
    />
  );
};

export default EmpireParticles;
