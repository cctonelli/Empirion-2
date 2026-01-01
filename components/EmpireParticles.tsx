import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  mass: number;
}

const EmpireParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -2000, y: -2000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = window.innerWidth < 768 ? 35 : 120;
    const connectionDistance = 210;
    const gravityForce = 0.35;
    const mouseRadius = 380;

    const colors = ['#3b82f6', '#f97316', '#6366f1', '#0ea5e9'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 2, // Base sólida inicial
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          mass: Math.random() * 0.9 + 0.3
        });
      }
    };

    const draw = () => {
      // Background Sólido para Performance
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid de Fundo
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
      ctx.lineWidth = 0.5;
      const step = 150;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      particles.forEach((p, i) => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * gravityForce * p.mass;
          p.vy += Math.sin(angle) * force * gravityForce * p.mass;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.035;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        /**
         * SANITIZAÇÃO CRÍTICA (v5.5-Bulletproof)
         * Evita o erro fatal IndexSizeError se o raio for negativo ou NaN.
         * Baseado na documentação de correção do deploy Vercel.
         */
        const dynamicPulse = Math.sin(p.pulse) * 0.8;
        let rawSize = (p.radius || 3) + dynamicPulse; // Fallback radius 3
        
        // Validação de número finito, absoluto e mínimo seguro
        if (!isFinite(rawSize) || isNaN(rawSize)) rawSize = 3;
        const size = Math.max(0.5, Math.abs(rawSize)); 
        
        const opacity = 0.15 + Math.sin(p.pulse) * 0.1;

        try {
          ctx.beginPath();
          // O método arc lança erro fatal se o terceiro argumento for negativo ou NaN.
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          
          if (dist < mouseRadius) {
            ctx.globalAlpha = Math.min(0.8, opacity + 0.4);
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
          } else {
            ctx.globalAlpha = Math.max(0, opacity);
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
        } catch (err) {
          console.warn('Empirion Engine: Arc draw error skipped', err);
        }
        
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dNodes = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (dNodes < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            const prox = dist < mouseRadius ? 0.15 : 0;
            ctx.globalAlpha = Math.max(0, ((1 - dNodes / connectionDistance) * 0.1) + prox);
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[-1] particle-canvas" />;
};

export default EmpireParticles;