import { useEffect, useRef } from 'react';

const INK = 'rgba(222, 190, 143, 0.16)';
const MUTED_INK = 'rgba(222, 190, 143, 0.08)';

export default function AtelierField({ paused = false, timeScale = 1 }) {
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);
  const timeScaleRef = useRef(timeScale);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let hidden = document.hidden;

    const frames = Array.from({ length: 5 }, (_, index) => ({
      x: 0.1 + index * 0.22,
      y: 0.18 + (index % 2) * 0.38,
      width: 0.12 + (index % 3) * 0.025,
      height: 0.18 + (index % 2) * 0.06,
      phase: index * 1.7,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (secs) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#17110d';
      ctx.fillRect(0, 0, width, height);

      const wash = ctx.createRadialGradient(
        width * 0.52,
        height * 0.45,
        0,
        width * 0.52,
        height * 0.45,
        Math.max(width, height) * 0.72,
      );
      wash.addColorStop(0, 'rgba(104, 69, 42, 0.13)');
      wash.addColorStop(0.62, 'rgba(38, 25, 18, 0.05)');
      wash.addColorStop(1, 'rgba(8, 6, 5, 0.22)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.strokeStyle = MUTED_INK;
      ctx.lineWidth = 1;
      const ruleY = height * 0.73 + Math.sin(secs * 0.08) * 8;
      ctx.beginPath();
      ctx.moveTo(width * 0.06, ruleY);
      ctx.lineTo(width * 0.94, ruleY);
      ctx.stroke();
      ctx.restore();

      frames.forEach((frame, index) => {
        const drift = Math.sin(secs * 0.06 + frame.phase) * 12;
        const x = width * frame.x + drift;
        const y = height * frame.y + Math.cos(secs * 0.045 + frame.phase) * 8;
        const frameWidth = width * frame.width;
        const frameHeight = height * frame.height;

        ctx.save();
        ctx.globalAlpha = 0.36 - index * 0.035;
        ctx.strokeStyle = index === 2 ? INK : MUTED_INK;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, frameWidth, frameHeight);
        ctx.globalAlpha *= 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y + frameHeight * 0.78);
        ctx.lineTo(x + frameWidth * 0.32, y + frameHeight * 0.52);
        ctx.lineTo(x + frameWidth * 0.56, y + frameHeight * 0.65);
        ctx.lineTo(x + frameWidth, y + frameHeight * 0.24);
        ctx.stroke();
        ctx.restore();
      });

      ctx.fillStyle = 'rgba(230, 207, 174, 0.4)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText('FIELD NOTE / 01', width * 0.06, height * 0.78);
      ctx.fillText('AKSHAT SHARMA', width * 0.78, height * 0.78);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      last = 0;
    };

    const loop = (time) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || hidden) return;
      if (time - last < 1000 / 30) return;
      if (last) elapsed += (time - last) * timeScaleRef.current;
      last = time;
      draw(elapsed / 1000);
    };

    resize();
    draw(0);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 block size-full" />;
}
