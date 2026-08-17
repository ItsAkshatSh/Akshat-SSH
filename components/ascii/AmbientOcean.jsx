/**
 * AmbientOcean
 * Lightweight, canvas-based ambient layer for the sub-page overlays.
 * Renders slow-rising ASCII bubble characters, a faint warm god ray in
 * the upper right, and a couple of short kelp silhouettes at the bottom
 * corners so the deep-sea theme from the hero carries through without
 * competing with the readable copy on top.
 *
 * Everything sits at low alpha (< 12%) so text on top stays crisp.
 */
import { useEffect, useRef } from 'react';

const BUBBLE_CHARS = ['·', '∘', '◦', '°', 'o'];
const KELP_CHARS = '|)|(||)|)|(||';

const AmbientOcean = () => {
  const bubbleCanvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = bubbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    let lastT = performance.now();

    const bubbles = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vy: 0.008 + Math.random() * 0.018, // fraction of H per second
      drift: 0.05 + Math.random() * 0.12, // horizontal amplitude in px
      phase: Math.random() * Math.PI * 2,
      size: 10 + Math.floor(Math.random() * 8),
      alpha: 0.06 + Math.random() * 0.09,
      char: BUBBLE_CHARS[Math.floor(Math.random() * BUBBLE_CHARS.length)],
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.textBaseline = 'middle';
    };

    const loop = (t) => {
      const dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;

      ctx.clearRect(0, 0, W, H);

      for (const b of bubbles) {
        b.y -= b.vy * dt;
        if (b.y < -0.05) {
          b.y = 1.05;
          b.x = Math.random();
        }
        const swayPx = Math.sin(t * 0.0009 + b.phase) * b.drift * 40;
        const px = b.x * W + swayPx;
        const py = b.y * H;
        ctx.font = `${b.size}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.fillStyle = `rgba(210, 226, 240, ${b.alpha})`;
        ctx.fillText(b.char, px, py);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Faint warm god ray from the upper right, matching the hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 90% at 92% -8%, rgba(255, 224, 196, 0.055), transparent 62%)',
        }}
      />
      {/* Rising ASCII bubbles. */}
      <canvas
        ref={bubbleCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {/* Short kelp silhouettes at the bottom corners. */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 flex items-end gap-1 px-2 py-2 pointer-events-none select-none"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          lineHeight: 1,
          color: 'rgba(90, 140, 128, 0.35)',
          whiteSpace: 'pre',
        }}
      >
        {KELP_CHARS.split('').map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${Math.sin(i * 0.6) * 2}px) rotate(${(Math.sin(i * 1.3) * 4).toFixed(1)}deg)`,
              opacity: 0.35 + (i % 3) * 0.15,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 flex items-end gap-1 px-2 py-2 pointer-events-none select-none"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          lineHeight: 1,
          color: 'rgba(90, 140, 128, 0.35)',
          whiteSpace: 'pre',
        }}
      >
        {KELP_CHARS.split('').map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${Math.sin(i * 0.7 + 2) * 2}px) rotate(${(Math.sin(i * 1.4 + 1) * 4).toFixed(1)}deg)`,
              opacity: 0.35 + ((i + 1) % 3) * 0.15,
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    </>
  );
};

export default AmbientOcean;
