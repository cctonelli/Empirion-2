import React, { useLayoutEffect, useRef } from 'react';

/**
 * Empire Cosmos Particles v9.0 (Bulletproof rendering)
 * Fixed: IndexSizeError on ctx.arc with NaN/Negative values
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

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'];
    const count = Math.min(130, Math.floor(window.innerWidth / 10));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 2, 
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 400 && dist > 0) {
          const force = (400 - dist) / 400;
          p.vx += (dx / dist) * force * 0.12;
          p.vy += (dy / dist) * force * 0.12;
        }

        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.035;

        p.x = (p.x + window.innerWidth) % window.innerWidth;
        p.y = (p.y + window.innerHeight) % window.innerHeight;

        // SANITIZAÇÃO V9.0 (Previne IndexSizeError)
        const dynamicPulse = Math.sin(p.pulse) * 1.5;
        let calculatedSize = p.radius + dynamicPulse;
        
        // Garante valor numérico válido e positivo
        if (!isFinite(calculatedSize) || calculatedSize <= 0) {
            calculatedSize = 1.0;
        }
        const size = Math.abs(calculatedSize);

        try {
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            
            ctx.globalAlpha = dist < 250 ? 1.0 : 0.6;
            ctx.shadowBlur = dist < 250 ? 35 : 15;
            ctx.shadowColor = p.color;
            
            ctx.fill();
        } catch (err) {
            // Skip failing frames
        }
        
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
