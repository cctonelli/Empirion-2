import React, { useEffect, useRef } from 'react';

const EmpireParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });
  const animationId = useRef<number>();

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
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Background Sólido para Performance
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid sutil overlay
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
      ctx.lineWidth = 0.5;
      const step = 150;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      particles.forEach((p) => {
        // Atração gravitacional do mouse
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 250 && dist > 0) {
          const force = (250 - dist) / 250;
          p.vx += (dx / dist) * force * 0.08;
          p.vy += (dy / dist) * force * 0.08;
        }

        // Fricção leve
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.035;

        // Warp bordas (suave com modulo)
        p.x = (p.x + canvas.width) % canvas.width;
        p.y = (p.y + canvas.height) % canvas.height;

        /**
         * SANITIZAÇÃO BULLETPROOF v6.0
         * Evita o erro fatal IndexSizeError se o raio for negativo ou NaN.
         * Força valores finitos e absolutos positivos.
         */
        const dynamicPulse = Math.sin(p.pulse) * 0.8;
        let rawSize = (p.radius || 2) + dynamicPulse;
        
        if (!isFinite(rawSize) || isNaN(rawSize)) {
          rawSize = p.radius || 2;
        }
        
        const size = Math.max(0.1, Math.abs(rawSize));
        
        const opacity = 0.15 + Math.sin(p.pulse) * 0.1;

        try {
          ctx.beginPath();
          // O método arc lança erro fatal se o terceiro argumento for negativo ou NaN.
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          
          if (dist < 250) {
            ctx.globalAlpha = Math.min(0.8, opacity + 0.4);
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
          } else {
            ctx.globalAlpha = Math.max(0, opacity);
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
        } catch (e) {
          // Skip frame error to prevent application crash
        }
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      });

      animationId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[-1] particle-canvas" />;
};

export default EmpireParticles;