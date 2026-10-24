import { useEffect, useRef } from 'react';

const GLYPHS = ' .·:+*#%@';
const PALETTE = ['#795b45', '#a9805c', '#d0a477', '#ead5b4'];

function rotate(point, rx, ry, rz) {
  let { x, y, z } = point;
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x1 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  return {
    x: x1 * cosZ - y1 * sinZ,
    y: x1 * sinZ + y1 * cosZ,
    z: z2,
  };
}

function createPoints() {
  const points = [];
  const segments = 96;
  const layers = 12;
  for (let layer = 0; layer < layers; layer += 1) {
    const tube = -0.56 + (layer / (layers - 1)) * 1.12;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2;
      const twist = angle * 1.6 + tube * 2.8;
      const radius = 1.25 + Math.cos(twist) * 0.12;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.58 + tube * 0.52,
        z: Math.sin(twist) * 0.52 + Math.cos(angle * 2 + tube) * 0.12,
        nx: Math.cos(angle),
        ny: Math.sin(angle),
        nz: Math.sin(twist),
        seed: segment + layer * 13,
      });
    }
  }

  for (let index = 0; index < 42; index += 1) {
    const angle = index * 2.399;
    const radius = 1.7 + (index % 7) * 0.12;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle * 1.7) * 0.9,
      z: Math.sin(angle) * radius,
      nx: Math.cos(angle),
      ny: 0.2,
      nz: Math.sin(angle),
      seed: index * 5,
      fragment: true,
    });
  }
  return points;
}

function createAmbientField() {
  return Array.from({ length: 110 }, (_, index) => {
    const angle = index * 2.417;
    const radius = 0.9 + (index % 13) * 0.18;
    return {
      x: Math.cos(angle) * radius * 1.45,
      y: Math.sin(angle * 1.61) * radius * 0.82,
      z: Math.sin(angle * 0.73) * 1.6,
      seed: index,
      size: index % 9 === 0 ? 1.35 : 0.8,
    };
  });
}

function drawDriftBands(ctx, width, height, secs, pointer) {
  const bands = [
    { y: 0.16, width: 0.28, phase: 0.2, glyph: '·' },
    { y: 0.31, width: 0.2, phase: 1.7, glyph: ':' },
    { y: 0.68, width: 0.25, phase: 3.1, glyph: '·' },
    { y: 0.84, width: 0.34, phase: 4.4, glyph: '+' },
  ];
  ctx.font = `${Math.max(9, Math.round(Math.min(width, height) * 0.011))}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  bands.forEach((band, bandIndex) => {
    const drift = Math.sin(secs * 0.16 + band.phase) * 0.04;
    const start = width * (0.06 + drift + (pointer.x - 0.5) * 0.015);
    const span = width * band.width;
    for (let index = 0; index < 20; index += 1) {
      const progress = index / 19;
      const wave = Math.sin(progress * 8 + secs * (0.22 + bandIndex * 0.025) + band.phase) * 12;
      const x = start + progress * span;
      const y = height * band.y + wave;
      ctx.globalAlpha = 0.14 + (Math.sin(progress * Math.PI) * 0.2);
      ctx.fillStyle = index % 5 === 0 ? '#c1986e' : '#87634b';
      ctx.fillText(index % 4 === 0 ? band.glyph : '.', x, y);
    }
  });
}

function drawSatellite(ctx, points, x, y, size, phase, secs, opacity = 0.32) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.2 + Math.sin(secs * 0.18 + phase) * 0.03);
  ctx.globalAlpha = opacity;
  ctx.font = `${Math.max(8, Math.round(size * 0.055))}px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  points.forEach((point, index) => {
    if (index % 4 !== 0) return;
    const rotated = rotate(point, -0.2, secs * 0.12 + phase, 0);
    const depth = rotated.z + 3;
    if (depth < 1.2) return;
    const brightness = Math.max(0.2, Math.min(1, 0.65 + rotated.z * 0.12));
    const glyph = GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(brightness * GLYPHS.length))];
    ctx.globalAlpha = opacity * (0.25 + brightness * 0.45);
    ctx.fillStyle = PALETTE[Math.min(PALETTE.length - 1, Math.floor(brightness * PALETTE.length))];
    ctx.fillText(glyph, rotated.x * size / depth, rotated.y * size / depth);
  });
  ctx.restore();
}

export default function InkField({ paused = false, timeScale = 1 } = {}) {
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
    let lastFrame = 0;
    let clock = 0;
    let hidden = document.hidden;
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ambientField = createAmbientField();
    let points = createPoints();
    const pointer = { x: 0.5, y: 0.5, strength: 0, target: 0 };

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
      const atmosphere = ctx.createRadialGradient(
        width * 0.7,
        height * 0.45,
        0,
        width * 0.7,
        height * 0.45,
        Math.max(width, height) * 0.72,
      );
      atmosphere.addColorStop(0, '#241812');
      atmosphere.addColorStop(0.52, '#1a110e');
      atmosphere.addColorStop(1, '#100b0a');
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      const cameraX = (pointer.x - 0.5) * 0.34 * pointer.strength + Math.sin(secs * 0.11) * 0.025;
      const cameraY = (pointer.y - 0.5) * 0.24 * pointer.strength + Math.cos(secs * 0.09) * 0.018;
      const spin = secs * 0.16;
      const projected = [];

      ctx.font = `${Math.max(10, Math.round(Math.min(width, height) * 0.012))}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ambientField.forEach((point) => {
        const rotated = rotate(point, -0.12 + cameraY * 0.4, spin * 0.35 + cameraX * 0.4, 0);
        const depth = rotated.z + 3.4;
        const scale = Math.min(width, height) * 0.3 / depth;
        const x = width * 0.5 + rotated.x * scale;
        const y = height * 0.5 + rotated.y * scale;
        if (x < 26 || x > width - 26 || y < 26 || y > height - 26) return;
        const twinkle = 0.45 + Math.sin(secs * 0.8 + point.seed) * 0.16;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = point.seed % 7 === 0 ? '#a9805c' : '#604b3d';
        ctx.fillText(point.seed % 9 === 0 ? '+' : point.seed % 4 === 0 ? '·' : '.', x, y);
      });
      drawDriftBands(ctx, width, height, secs, pointer);

      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#8d7057';
      ctx.lineWidth = 0.65;
      for (let index = 0; index < 3; index += 1) {
        const radius = Math.min(width, height) * (0.22 + index * 0.075);
        ctx.beginPath();
        ctx.ellipse(
          width * 0.71,
          height * 0.5,
          radius,
          radius * (0.27 + index * 0.025),
          -0.16 + index * 0.08,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = '#a9805c';
      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.78);
      ctx.lineTo(width * 0.21, height * 0.78);
      ctx.moveTo(width * 0.08, height * 0.78);
      ctx.lineTo(width * 0.08, height * 0.72);
      ctx.stroke();
      ctx.font = `${Math.max(8, Math.round(Math.min(width, height) * 0.009))}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#a9805c';
      ctx.fillText('FIELD / 03', width * 0.145, height * 0.75);

      drawSatellite(ctx, points, width * 0.17, height * 0.73, Math.min(width, height) * 0.18, 0.8, secs, 0.2);
      drawSatellite(ctx, points, width * 0.91, height * 0.2, Math.min(width, height) * 0.15, 2.1, secs, 0.18);
      drawSatellite(ctx, points, width * 0.25, height * 0.14, Math.min(width, height) * 0.12, 3.4, secs, 0.14);

      points.forEach((point) => {
        const rotated = rotate(
          point,
          -0.12 + cameraY,
          spin + cameraX,
          0.08 + Math.sin(secs * 0.08) * 0.04,
        );
        const depth = rotated.z + 2.8;
        if (depth < 1.2) return;
        const scale = Math.min(width, height) * 0.25 / depth;
        const x = width * 0.71 + rotated.x * scale;
        const y = height * 0.5 + rotated.y * scale;
        const light = Math.max(
          0,
          Math.min(1, point.nx * -0.55 + point.ny * -0.35 + point.nz * 0.7 + 0.55),
        );
        const depthFade = Math.max(0.1, Math.min(1, 1.2 - rotated.z * 0.18));
        projected.push({
          x,
          y,
          z: rotated.z,
          brightness: light * depthFade,
          fragment: point.fragment,
          seed: point.seed,
        });
      });

      projected.sort((a, b) => a.z - b.z);
      ctx.font = `${Math.max(10, Math.round(Math.min(width, height) * 0.014))}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      projected.forEach((point) => {
        const distance = Math.hypot(
          point.x - pointer.x * width,
          point.y - pointer.y * height,
        );
        const cursorInfluence = Math.max(0, 1 - distance / 220) * pointer.strength;
        const cursorLift = cursorInfluence;
        const brightness = Math.max(0, Math.min(1, point.brightness + cursorLift * 0.22));
        const glyphIndex = Math.min(GLYPHS.length - 1, Math.floor(brightness * GLYPHS.length));
        if (glyphIndex < 1) return;
        const directionX = (point.x - pointer.x * width) / Math.max(1, distance);
        const directionY = (point.y - pointer.y * height) / Math.max(1, distance);
        const displacedX = point.x + directionX * cursorInfluence * 16;
        const displacedY = point.y + directionY * cursorInfluence * 16;
        const glyph = cursorInfluence > 0.48 && point.seed % 5 === 0
          ? GLYPHS[(glyphIndex + 3) % GLYPHS.length]
          : point.fragment
          ? (point.seed % 3 === 0 ? '+' : '·')
          : GLYPHS[glyphIndex];
        ctx.globalAlpha = point.fragment ? 0.28 + brightness * 0.3 : 0.34 + brightness * 0.72;
        ctx.fillStyle = PALETTE[Math.min(PALETTE.length - 1, Math.floor(brightness * PALETTE.length))];
        ctx.fillText(glyph, displacedX, displacedY);
      });

      ctx.globalAlpha = 1;

      const glow = ctx.createRadialGradient(
        pointer.x * width,
        pointer.y * height,
        0,
        pointer.x * width,
        pointer.y * height,
        240,
      );
      glow.addColorStop(0, `rgba(220, 171, 112, ${0.1 * pointer.strength})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(pointer.x * width - 240, pointer.y * height - 240, 480, 480);

      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = '#d8bc95';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(width * 0.72, height * 0.5, Math.min(width, height) * 0.42, Math.min(width, height) * 0.15, -0.16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      const vignette = ctx.createRadialGradient(
        width * 0.56,
        height * 0.48,
        Math.min(width, height) * 0.24,
        width * 0.56,
        height * 0.48,
        Math.max(width, height) * 0.72,
      );
      vignette.addColorStop(0, 'rgba(10, 6, 5, 0)');
      vignette.addColorStop(1, 'rgba(7, 4, 4, 0.48)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const loop = (time) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || hidden) return;
      if (time - lastFrame < 1000 / 30) return;
      if (lastFrame) clock += (time - lastFrame) * timeScaleRef.current;
      lastFrame = time;
      pointer.strength += (pointer.target - pointer.strength) * 0.1;
      draw(reduced ? 0 : clock / 1000);
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX / Math.max(1, width);
      pointer.y = event.clientY / Math.max(1, height);
      pointer.target = 1;
    };
    const onPointerLeave = () => {
      pointer.target = 0;
    };
    const onVisibility = () => {
      hidden = document.hidden;
      lastFrame = 0;
    };
    const onMotionChange = (event) => {
      reduced = event.matches;
    };

    resize();
    draw(0);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener?.('change', onMotionChange);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener?.('change', onMotionChange);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
}
