import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 54;

function createParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
    angle: (index / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.4,
    radius: 0.18 + Math.random() * 0.42,
    speed: 0.00005 + Math.random() * 0.00008,
    size: 0.6 + Math.random() * 1.4,
    alpha: 0.18 + Math.random() * 0.45,
  }));
}

export default function SignalArchiveField({ paused = false }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const particles = createParticles();
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let last = performance.now();
    let reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event) => {
      pointer.targetX = event.clientX / Math.max(1, width);
      pointer.targetY = event.clientY / Math.max(1, height);
    };

    const draw = (time) => {
      const dt = Math.min(40, time - last);
      last = time;
      const motion = reducedMotion ? 0 : dt;
      pointer.x += (pointer.targetX - pointer.x) * 0.035;
      pointer.y += (pointer.targetY - pointer.y) * 0.035;

      if (!pausedRef.current) {
        context.clearRect(0, 0, width, height);
        const cx = width * (0.52 + (pointer.x - 0.5) * 0.025);
        const cy = height * (0.48 + (pointer.y - 0.5) * 0.018);
        const radius = Math.min(width, height) * 0.34;

        const glow = context.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.7);
        glow.addColorStop(0, 'rgba(221, 174, 103, 0.08)');
        glow.addColorStop(0.5, 'rgba(221, 174, 103, 0.025)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(cx, cy);
        context.rotate((pointer.x - 0.5) * 0.035);
        context.strokeStyle = 'rgba(231, 218, 192, 0.11)';
        context.lineWidth = 1;
        for (let ring = 0; ring < 5; ring += 1) {
          context.beginPath();
          context.ellipse(0, 0, radius * (0.42 + ring * 0.15), radius * (0.18 + ring * 0.08), ring * 0.24, 0, Math.PI * 2);
          context.stroke();
        }
        context.strokeStyle = 'rgba(221, 174, 103, 0.16)';
        context.beginPath();
        context.arc(0, 0, radius * 1.02, -0.6 + time * 0.00012, 0.25 + time * 0.00012);
        context.stroke();
        context.restore();

        context.strokeStyle = 'rgba(231, 218, 192, 0.035)';
        context.lineWidth = 1;
        const grid = 72;
        for (let x = (width * 0.5) % grid; x < width; x += grid) {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x + (pointer.x - 0.5) * 18, height);
          context.stroke();
        }
        for (let y = (height * 0.5) % grid; y < height; y += grid) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y + (pointer.y - 0.5) * 12);
          context.stroke();
        }

        particles.forEach((particle) => {
          particle.angle += particle.speed * motion;
          const x = cx + Math.cos(particle.angle) * radius * particle.radius;
          const y = cy + Math.sin(particle.angle) * radius * particle.radius * 0.44;
          context.fillStyle = `rgba(221, 174, 103, ${particle.alpha})`;
          context.fillRect(x, y, particle.size, particle.size);
        });

        context.fillStyle = 'rgba(231, 218, 192, 0.38)';
        context.font = '10px JetBrains Mono, monospace';
        context.fillText('SIGNAL / 01', 28, height - 30);
        context.fillText('ARCHIVE', width - 82, 30);
      }
      frame = requestAnimationFrame(draw);
    };

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotion = () => {
      reducedMotion = Boolean(motionQuery?.matches);
    };
    motionQuery?.addEventListener?.('change', handleMotion);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      motionQuery?.removeEventListener?.('change', handleMotion);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 h-full w-full pointer-events-none"
    />
  );
}
