'use client';

import { useEffect, useRef } from 'react';

const ASCII_CHARS = ['·', '°', '~', '+', '*', ':', 'x', '≈', '•'];

export function CursorTrail({
  pointsNumber = 35,
  widthFactor = 0.3,
  spring = 0.45,
  friction = 0.48,
  color = 'rgba(226, 232, 240, 0.85)', // Cool ocean white (#e2e8f0)
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const trailRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const mouseMovedRef = useRef(false);
  const particlesRef = useRef([]);
  const shockwavesRef = useRef([]);
  const isHoveredRef = useRef(false);
  const hoverScaleRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });

    // Hide default OS cursor
    const root = document.documentElement;
    root.classList.add('cursor-trail-active');

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const updateMousePosition = (x, y) => {
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      mouseMovedRef.current = true;
    };

    const initTrail = () => {
      trailRef.current = new Array(pointsNumber);
      for (let i = 0; i < pointsNumber; i++) {
        trailRef.current[i] = {
          x: pointerRef.current.x,
          y: pointerRef.current.y,
          dx: 0,
          dy: 0,
        };
      }
    };

    // Detect if hovering an interactive element
    const checkHover = (e) => {
      const target = e.target;
      if (!target) return;
      const isInteractive =
        target.closest('a, button, input, [role="button"], .interactive, .item__image, [onclick]') !== null;
      isHoveredRef.current = isInteractive;
    };

    // Spawn click shockwave and ASCII character burst
    const spawnClickEffect = (x, y) => {
      shockwavesRef.current.push({
        x,
        y,
        radius: 3,
        maxRadius: isHoveredRef.current ? 36 : 24,
        alpha: 0.7,
        lineWidth: 1.2,
      });

      const particleCount = 10;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
        const speed = 1.8 + Math.random() * 2.8;
        const char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          char,
          alpha: 0.9,
          decay: 0.03 + Math.random() * 0.02,
          fontSize: 10 + Math.floor(Math.random() * 4),
        });
      }
    };

    // Spawn speed floating ASCII bubbles/glyphs
    const spawnSpeedParticles = (x, y, speed) => {
      if (speed < 4.5) return;
      if (Math.random() > 0.4) return;

      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 2;
      const char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * spread * 0.3,
        vy: Math.sin(angle) * spread * 0.3 - 0.25, // gentle upward float
        char,
        alpha: 0.75,
        decay: 0.035 + Math.random() * 0.03,
        fontSize: 9 + Math.floor(Math.random() * 3),
      });
    };

    const update = (t) => {
      if (!mouseMovedRef.current) {
        pointerRef.current.x =
          (0.5 + 0.28 * Math.cos(0.002 * t) * Math.sin(0.004 * t)) * window.innerWidth;
        pointerRef.current.y =
          (0.5 + 0.18 * Math.cos(0.004 * t) + 0.08 * Math.sin(0.008 * t)) * window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth hover scale transition
      const targetHoverScale = isHoveredRef.current ? 1.5 : 1.0;
      hoverScaleRef.current += (targetHoverScale - hoverScaleRef.current) * 0.15;

      // Update trail coordinates with spring physics
      let headSpeed = 0;
      trailRef.current.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointerRef.current : trailRef.current[pIdx - 1];
        const springFactor = pIdx === 0 ? 0.5 * spring : spring;

        p.dx += (prev.x - p.x) * springFactor;
        p.dy += (prev.y - p.y) * springFactor;
        p.dx *= friction;
        p.dy *= friction;
        p.x += p.dx;
        p.y += p.dy;

        if (pIdx === 0) {
          headSpeed = Math.hypot(p.dx, p.dy);
        }
      });

      // Emit ASCII speed particles
      spawnSpeedParticles(trailRef.current[0].x, trailRef.current[0].y, headSpeed);

      // 1. Crisp, elegant ocean trail ribbon (reduced glow)
      ctx.save();
      ctx.shadowColor = 'rgba(226, 232, 240, 0.3)';
      ctx.shadowBlur = 3; // Reduced subtle glow
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < trailRef.current.length - 1; i++) {
        const p1 = trailRef.current[i];
        const p2 = trailRef.current[i + 1];

        const xc = 0.5 * (p1.x + p2.x);
        const yc = 0.5 * (p1.y + p2.y);

        const progress = i / trailRef.current.length;
        const segmentWidth = widthFactor * (pointsNumber - i) * (0.85 + 0.15 * hoverScaleRef.current);

        ctx.beginPath();
        if (i === 1) {
          ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        } else {
          const prevXc = 0.5 * (trailRef.current[i - 1].x + p1.x);
          const prevYc = 0.5 * (trailRef.current[i - 1].y + p1.y);
          ctx.moveTo(prevXc, prevYc);
        }
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);

        const alpha = Math.max(0, (1 - progress * 0.92) * 0.85);
        ctx.strokeStyle = `rgba(226, 232, 240, ${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.5, segmentWidth);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Render ASCII glyph particles (drifting bubbles & spark chars)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.font = `${p.fontSize}px 'JetBrains Mono', ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.char, p.x, p.y);
        ctx.restore();
      }

      // 3. Render click ocean shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.18;
        sw.alpha -= 0.035;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius - 1) {
          shockwavesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.lineWidth = sw.lineWidth;
        ctx.setLineDash([3, 3]); // Dashed ASCII-styled ocean ripple
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Precision pointer head & subtle ASCII reticle
      const head = pointerRef.current;
      ctx.save();
      const ringRadius = (isHoveredRef.current ? 12 : 6) * hoverScaleRef.current;
      const pulse = 1 + Math.sin(t * 0.008) * 0.06;

      // Outer delicate reticle ring
      ctx.beginPath();
      ctx.arc(head.x, head.y, ringRadius * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = isHoveredRef.current
        ? 'rgba(255, 255, 255, 0.85)'
        : 'rgba(226, 232, 240, 0.3)';
      ctx.lineWidth = isHoveredRef.current ? 1.5 : 1;
      ctx.stroke();

      // Sharp central core dot
      ctx.beginPath();
      ctx.arc(head.x, head.y, isHoveredRef.current ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      animationRef.current = requestAnimationFrame(update);
    };

    const handleMouseMove = (e) => {
      updateMousePosition(e.clientX, e.clientY);
      checkHover(e);
    };

    const handleTouchMove = (e) => {
      if (e.targetTouches[0]) {
        updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
      }
    };

    const handleClick = (e) => {
      updateMousePosition(e.clientX, e.clientY);
      spawnClickEffect(e.clientX, e.clientY);
    };

    const handleResize = () => {
      setupCanvas();
      initTrail();
    };

    setupCanvas();
    initTrail();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      root.classList.remove('cursor-trail-active');
    };
  }, [pointsNumber, widthFactor, spring, friction, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}