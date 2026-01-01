import React, { useEffect, useRef } from 'react';

const EmpireParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: -2000, y: -2000 };
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
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      // Trail effect for high-fidelity aesthetics
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // Gravitational attraction logic
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < 250 && dist > 0) {
          const force = (250 - dist) / 250;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }

        // Slight physics friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.035;

        // Screen wrapping
        p.x = (p.x + canvas.width) % canvas.width;
        p.y = (p.y + canvas.height) % canvas.height;

        /**
         * RADIUS SANITIZATION v6.0
         * Ensures ctx.arc radius is never negative, NaN, or non-finite.
         */
        const dynamicPulse = Math.sin(p.pulse) * 0.8;
        let rawSize = p.radius + dynamicPulse;
        if (!isFinite(rawSize) || isNaN(rawSize) || rawSize <= 0) {
          rawSize = p.radius || 2.0;
        }
        const size = Math.max(0.5, Math.abs(rawSize));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        
        // Dynamic glow on hover
        if (dist < 180) {
          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
        } else {
          ctx.globalAlpha = 0.4;
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[-1] particle-canvas" 
      aria-hidden="true"
    />
  );
};

export default EmpireParticles;