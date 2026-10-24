import React, { useEffect, useRef } from 'react';

/**
 * VoidField — an ocean-like deep-space atmosphere.
 *
 * The scene is built from slow currents of nebula dust, star motes, and a
 * a small set of high-resolution ASCII worlds and restrained atmospheric
 * motion so it feels alive without becoming visually crowded behind the page.
 */

const CELL_W = 7;
const CELL_H = 12;
const FONT_SIZE = 12;
const TARGET_FPS = 30;
const RAMP = ' .·:-=+*x#%@';
const STAR_GLYPHS = ['·', '·', '✦', '+', '*'];
const DUST_GLYPHS = ['.', '·', ':', '°'];
const GLITCH = '!@#$%&*+=~/\\|<>[]{}?';
const PLANET_RAMP = ' .·:;+=x#%@';

export default function VoidField({ paused = false, timeScale = 1 } = {}) {
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
    const grid = document.createElement('canvas');
    const gridCtx = grid.getContext('2d', { willReadFrequently: true });
    if (!ctx || !gridCtx) return undefined;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let stars = [];
    let dust = [];
    let currents = [];
    let streamers = [];
    let shootingStars = [];
    let raf = 0;
    let lastFrame = 0;
    let clock = 0;
    let nextShooter = 3;
    let hidden = document.hidden;

    const cursor = { x: -9999, y: -9999, strength: 0, target: 0 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      cols = Math.max(20, Math.ceil(width / CELL_W));
      rows = Math.max(10, Math.ceil(height / CELL_H));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace`;
      ctx.textBaseline = 'top';

      grid.width = cols;
      grid.height = rows;
      gridCtx.font = `${FONT_SIZE / CELL_H}px monospace`;

      const starCount = Math.floor((cols * rows) / 54);
      stars = Array.from({ length: starCount }, (_, index) => ({
        x: Math.random() * cols,
        y: Math.random() * rows,
        drift: 0.002 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        alpha: 0.22 + Math.random() * 0.7,
        glyph: STAR_GLYPHS[index % STAR_GLYPHS.length],
        warm: Math.random() < 0.12,
      }));

      const dustCount = Math.floor((cols * rows) / 34);
      dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * cols,
        y: Math.random() * rows,
        phase: Math.random() * Math.PI * 2,
        size: 0.35 + Math.random() * 0.9,
        alpha: 0.1 + Math.random() * 0.35,
        speed: 0.012 + Math.random() * 0.025,
      }));

      currents = [
        { x: cols * 0.05, y: rows * 0.32, width: cols * 0.42, height: rows * 0.16, phase: 0.2, hue: 'blue' },
        { x: cols * 0.58, y: rows * 0.16, width: cols * 0.5, height: rows * 0.13, phase: 2.8, hue: 'violet' },
        { x: cols * 0.68, y: rows * 0.72, width: cols * 0.44, height: rows * 0.2, phase: 4.3, hue: 'amber' },
        { x: cols * 0.18, y: rows * 0.82, width: cols * 0.35, height: rows * 0.12, phase: 1.4, hue: 'blue' },
      ];

      streamers = Array.from({ length: 6 }, (_, index) => ({
        y: rows * (0.08 + (index / 10) * 0.84),
        amplitude: 1.1 + Math.random() * 2.2,
        length: 0.35 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.035 + Math.random() * 0.03,
        hue: index % 4 === 0 ? 'violet' : index % 5 === 0 ? 'amber' : 'blue',
      }));
    };

    const paintCurrent = (current, secs) => {
      const drift = Math.sin(secs * 0.05 + current.phase) * rows * 0.03;
      const x = current.x + Math.sin(secs * 0.025 + current.phase) * cols * 0.035;
      const y = current.y + drift;
      const gradient = gridCtx.createRadialGradient(x, y, 0, x, y, current.width);
      const colors = {
        blue: ['rgba(80, 150, 220, 0.07)', 'rgba(40, 90, 150, 0)'],
        violet: ['rgba(155, 105, 205, 0.055)', 'rgba(90, 55, 140, 0)'],
        amber: ['rgba(210, 155, 105, 0.045)', 'rgba(150, 90, 55, 0)'],
      };
      const [inner, outer] = colors[current.hue];
      gradient.addColorStop(0, inner);
      gradient.addColorStop(1, outer);
      gridCtx.fillStyle = gradient;
      gridCtx.save();
      gridCtx.translate(x, y);
      gridCtx.rotate(Math.sin(secs * 0.018 + current.phase) * 0.18);
      gridCtx.scale(1, current.height / current.width);
      gridCtx.translate(-x, -y);
      gridCtx.fillRect(x - current.width, y - current.width, current.width * 2, current.width * 2);
      gridCtx.restore();
    };

    const drawCurrents = (secs) => {
      gridCtx.clearRect(0, 0, cols, rows);
      currents.forEach((current) => paintCurrent(current, secs));
      gridCtx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < currents.length; i += 1) {
        const current = currents[i];
        for (let line = 0; line < 3; line += 1) {
          const y = current.y + (line - 1) * 1.8;
          gridCtx.beginPath();
          for (let x = current.x - current.width * 0.9; x < current.x + current.width * 0.9; x += 2) {
            const wave = Math.sin(x * 0.055 + secs * 0.08 + current.phase + line) * (0.8 + line * 0.12);
            const px = x + Math.sin(secs * 0.035 + line) * 1.5;
            const py = y + wave;
            if (x === current.x - current.width * 0.9) gridCtx.moveTo(px, py);
            else gridCtx.lineTo(px, py);
          }
          const color = current.hue === 'amber' ? 'rgba(224, 178, 135, 0.035)' : current.hue === 'violet' ? 'rgba(186, 146, 224, 0.035)' : 'rgba(132, 190, 235, 0.045)';
          gridCtx.strokeStyle = color;
          gridCtx.lineWidth = 0.35;
          gridCtx.stroke();
        }
      }
      gridCtx.globalCompositeOperation = 'source-over';
    };

    const drawStreamers = (secs) => {
      gridCtx.save();
      gridCtx.globalCompositeOperation = 'lighter';
      streamers.forEach((stream, index) => {
        const start = ((secs * stream.speed + stream.phase) % 2 - 0.5) * cols;
        const span = cols * stream.length;
        const color = stream.hue === 'amber'
          ? 'rgba(226, 178, 132, 0.10)'
          : stream.hue === 'violet'
            ? 'rgba(190, 151, 226, 0.10)'
            : 'rgba(138, 198, 240, 0.13)';

        gridCtx.beginPath();
        for (let step = 0; step <= 24; step += 1) {
          const progress = step / 24;
          const x = start + progress * span;
          const y = stream.y
            + Math.sin(progress * 7 + secs * 0.08 + stream.phase) * stream.amplitude
            + Math.sin(progress * 2.5 + index) * 0.7;
          if (step === 0) gridCtx.moveTo(x, y);
          else gridCtx.lineTo(x, y);
        }
        gridCtx.strokeStyle = color;
        gridCtx.lineWidth = 0.55;
        gridCtx.stroke();

        const pulseX = start + ((secs * (stream.speed + 0.012) + stream.phase) % 1) * span;
        const pulseY = stream.y + Math.sin((pulseX - start) / span * 7 + secs * 0.08 + stream.phase) * stream.amplitude;
        gridCtx.fillStyle = color.replace('0.10', '0.38').replace('0.13', '0.42');
        gridCtx.beginPath();
        gridCtx.arc(pulseX, pulseY, 0.9, 0, Math.PI * 2);
        gridCtx.fill();
      });
      gridCtx.restore();
    };

    const hoverOffset = (px, py) => {
      const dx = px + CELL_W * 0.5 - cursor.x;
      const dy = py + CELL_H * 0.5 - cursor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= 140 || cursor.strength <= 0.01) return { x: 0, y: 0 };
      const force = (1 - distance / 140) * cursor.strength;
      return {
        x: (dx / (distance || 1)) * force * 12,
        y: (dy / (distance || 1)) * force * 12,
        force,
      };
    };

    const drawSolarHierarchy = (secs) => {
      const narrow = cols / rows < 1.25;
      const light = { x: -0.58, y: -0.34, z: 0.74 };
      const drawOrbit = (centerX, centerY, radiusX, radiusY, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#9ab6c9';
        for (let step = 0; step < 72; step += 1) {
          if (step % 3 === 1) continue;
          const angle = (step / 72) * Math.PI * 2 - 0.12;
          const x = (centerX + Math.cos(angle) * radiusX) * CELL_W;
          const y = (centerY + Math.sin(angle) * radiusY) * CELL_H;
          const offset = hoverOffset(x, y);
          ctx.fillText('·', x + offset.x * 0.2, y + offset.y * 0.2);
        }
        ctx.globalAlpha = 1;
      };

      const drawSaturnSignal = (centerX, centerY, radius) => {
        const pulse = 0.5 + Math.sin(secs * 0.32) * 0.5;
        const bands = [
          { width: 1.28, height: 0.48, alpha: 0.15, glyph: '·' },
          { width: 1.52, height: 0.62, alpha: 0.1, glyph: ':' },
          { width: 1.82, height: 0.8, alpha: 0.065, glyph: '+' },
        ];

        bands.forEach((band, bandIndex) => {
          ctx.fillStyle = bandIndex === 2 ? '#b6a2c6' : '#d7b47b';
          for (let step = 0; step < 96; step += 1) {
            if ((step + bandIndex * 9) % (bandIndex + 3) !== 0) continue;
            const angle = (step / 96) * Math.PI * 2 + secs * (0.008 + bandIndex * 0.003);
            const arc = Math.sin(angle * 2 + bandIndex * 1.7);
            if (arc < -0.12) continue;
            const x = centerX + Math.cos(angle) * radius * band.width;
            const y = centerY + Math.sin(angle) * radius * band.height;
            const offset = hoverOffset(x * CELL_W, y * CELL_H);
            ctx.globalAlpha = band.alpha * (0.7 + pulse * 0.6) * (0.62 + arc * 0.38);
            ctx.fillText(band.glyph, x * CELL_W + offset.x * 0.16, y * CELL_H + offset.y * 0.16);
          }
        });

        ctx.globalAlpha = 0.2 + pulse * 0.12;
        ctx.fillStyle = '#e4c58f';
        for (let index = 0; index < 8; index += 1) {
          const angle = -0.82 + index * 0.12 + Math.sin(secs * 0.18) * 0.025;
          const distance = radius * (1.72 + index * 0.14);
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance * 0.46;
          const offset = hoverOffset(x * CELL_W, y * CELL_H);
          ctx.fillText(index % 3 === 0 ? '+' : '·', x * CELL_W + offset.x * 0.15, y * CELL_H + offset.y * 0.15);
        }
        ctx.globalAlpha = 1;
      };

      const drawSun = (centerX, centerY, radius) => {
        const pulse = 1 + Math.sin(secs * 0.5) * 0.035;
        const sunRadius = radius * pulse;
        for (let y = Math.floor(centerY - sunRadius * 1.5); y <= centerY + sunRadius * 1.5; y += 1) {
          for (let x = Math.floor(centerX - sunRadius * 1.5); x <= centerX + sunRadius * 1.5; x += 1) {
            const distance = Math.sqrt(
              Math.pow((x - centerX) / (CELL_H / CELL_W), 2) + Math.pow(y - centerY, 2),
            );
            if (distance > sunRadius * 1.35) continue;
            const offset = hoverOffset(x * CELL_W, y * CELL_H);
            ctx.globalAlpha = distance > sunRadius ? 0.24 : 0.86;
            ctx.fillStyle = distance > sunRadius ? '#c38f62' : distance < sunRadius * 0.48 ? '#fff0cb' : '#e6bd86';
            ctx.fillText(distance > sunRadius ? '·' : distance < sunRadius * 0.48 ? '@' : '#', x * CELL_W + offset.x * 0.2, y * CELL_H + offset.y * 0.2);
          }
        }
        ctx.globalAlpha = 1;
      };

      const drawRings = (centerX, centerY, radius, alpha, front) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#e1b56d';
        for (let step = 0; step < 96; step += 1) {
          const angle = (step / 96) * Math.PI * 2;
          const y = Math.sin(angle) * radius * 0.27;
          const depth = Math.sin(angle);
          if (front !== depth > 0) continue;
          const x = Math.cos(angle) * radius * 1.72;
          const offset = hoverOffset((centerX + x) * CELL_W, (centerY + y) * CELL_H);
          ctx.fillText(step % 3 === 0 ? '#' : '=', (centerX + x) * CELL_W + offset.x * 0.25, (centerY + y) * CELL_H + offset.y * 0.25);
        }
        ctx.globalAlpha = 1;
      };

      const drawSphere = ({ centerX, centerY, radius, colors, bands, atmosphere = 0.28, detail = 1 }) => {
        const radiusX = radius * (CELL_H / CELL_W);
        for (let y = Math.floor(centerY - radius - 2); y <= centerY + radius + 2; y += 1) {
          for (let x = Math.floor(centerX - radiusX - 2); x <= centerX + radiusX + 2; x += 1) {
            const nx = (x - centerX) / radiusX;
            const ny = (y - centerY) / radius;
            const distance = Math.sqrt(nx * nx + ny * ny);
            if (distance > 1.12) continue;

            const px = x * CELL_W;
            const py = y * CELL_H;
            const offset = hoverOffset(px, py);
            if (distance > 0.94) {
              if (((x * 17 + y * 31 + Math.floor(secs * 2)) & 3) !== 0) continue;
              ctx.globalAlpha = (1 - (distance - 0.94) / 0.18) * atmosphere;
              ctx.fillStyle = colors.rim;
              ctx.fillText('·', px + offset.x * 0.35, py + offset.y * 0.35);
              continue;
            }

            const nz = Math.sqrt(Math.max(0, 1 - distance * distance));
            const dot = nx * light.x + ny * light.y + nz * light.z;
            const lit = Math.max(0, dot);
            const longitude = Math.atan2(nx, nz);
            const bandNoise = Math.sin(ny * bands + Math.sin(longitude * 3 + secs * 0.08) * 0.8) * 0.12;
            const detailNoise = Math.sin(nx * 19 + ny * 13 + secs * 0.06) * 0.06 * detail;
            const brightness = Math.max(0, Math.min(1, lit * 0.78 + nz * 0.15 + bandNoise + detailNoise));
            const rampIndex = Math.min(PLANET_RAMP.length - 1, Math.floor(brightness * PLANET_RAMP.length));
            const character = PLANET_RAMP[rampIndex];
            if (character === ' ') continue;

            const shade = brightness > 0.7 ? colors.high : brightness > 0.38 ? colors.mid : colors.low;
            const glyph = offset.force > 0.08 && Math.random() < offset.force * 0.22
              ? GLITCH[Math.floor(Math.random() * GLITCH.length)]
              : character;
            ctx.globalAlpha = 0.96;
            ctx.fillStyle = shade;
            ctx.fillText(glyph, px + offset.x * 0.55, py + offset.y * 0.55);
          }
        }
      };

      const saturnX = narrow ? cols * 0.70 : cols * 0.78;
      const saturnY = narrow ? rows * 0.66 : rows * 0.66;
      const saturnRadius = narrow ? rows * 0.22 : rows * 0.30;

      drawOrbit(cols * 0.70, rows * 0.56, cols * 0.28, rows * 0.17, 0.11);
      drawOrbit(cols * 0.52, rows * 0.38, cols * 0.19, rows * 0.11, 0.08);
      drawSun(narrow ? cols * 0.15 : cols * 0.17, rows * 0.18, narrow ? 2.3 : 2.8);
      drawSaturnSignal(saturnX, saturnY, saturnRadius);

      drawSphere({
        centerX: saturnX,
        centerY: saturnY,
        radius: saturnRadius,
        colors: { low: '#8f5428', mid: '#d28b43', high: '#ffe0a4', rim: '#efb86f' },
        bands: 15,
        detail: 1.2,
        atmosphere: 0.34,
      });
      drawRings(saturnX, saturnY, narrow ? rows * 0.33 : rows * 0.48, 0.92, true);
      drawRings(saturnX, saturnY, narrow ? rows * 0.33 : rows * 0.48, 0.68, false);
      drawSphere({
        centerX: cols * 0.47,
        centerY: rows * 0.18,
        radius: Math.max(5, rows * 0.105),
        colors: { low: '#493f58', mid: '#887d9a', high: '#cfc9d6', rim: '#a895bf' },
        bands: 10,
        detail: 0.8,
        atmosphere: 0.22,
      });
      drawSphere({
        centerX: cols * 0.86,
        centerY: rows * 0.31,
        radius: Math.max(2.5, rows * 0.052),
        colors: { low: '#5e5143', mid: '#a78e6e', high: '#e5cfaa', rim: '#c5a77e' },
        bands: 7,
        detail: 0.5,
        atmosphere: 0.16,
      });
      ctx.globalAlpha = 1;
    };

    const draw = (secs) => {
      drawCurrents(secs);
      drawStreamers(secs);
      const currentPixels = gridCtx.getImageData(0, 0, cols, rows).data;
      ctx.clearRect(0, 0, width, height);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const index = (y * cols + x) * 4;
          const glow = Math.max(currentPixels[index], currentPixels[index + 1], currentPixels[index + 2]);
          if (glow < 18) continue;
          const texture = ((x * 73856093) ^ (y * 19349663)) & 255;
          if (glow < 82 && texture > glow * 2.2) continue;
          const character = RAMP[Math.min(RAMP.length - 1, Math.floor((glow / 255) * RAMP.length))];
          ctx.globalAlpha = Math.min(0.075, glow / 1250);
          ctx.fillStyle = currentPixels[index + 1] > currentPixels[index] ? '#9bc9ed' : '#c4a9dc';
          const offset = hoverOffset(x * CELL_W, y * CELL_H);
          const glyph = offset.force > 0.01 && Math.random() < offset.force * 0.35
            ? GLITCH[Math.floor(Math.random() * GLITCH.length)]
            : character;
          ctx.fillText(glyph, x * CELL_W + offset.x, y * CELL_H + offset.y);
        }
      }
      ctx.globalAlpha = 1;

      dust.forEach((particle) => {
        const px = particle.x
          + Math.sin(secs * particle.speed + particle.phase) * 1.4
          + Math.sin(secs * 0.08 + particle.y * 0.04) * 0.9;
        const py = particle.y - secs * particle.speed * 1.9;
        const wrappedY = ((py % rows) + rows) % rows;
        const pulse = 0.55 + Math.sin(secs * 0.8 + particle.phase) * 0.45;
        ctx.globalAlpha = particle.alpha * pulse * 0.8;
        ctx.fillStyle = '#b5cfe3';
        const glyph = pulse > 0.86 ? '✦' : DUST_GLYPHS[Math.floor(particle.phase * 2) % DUST_GLYPHS.length];
        ctx.fillText(glyph, px * CELL_W, wrappedY * CELL_H);
      });

      stars.forEach((star) => {
        const twinkle = 0.55 + Math.sin(secs * star.speed + star.phase) * 0.45;
        let x = star.x + Math.sin(secs * star.drift + star.phase) * 1.5;
        let y = ((star.y - secs * star.drift * 0.25) % rows + rows) % rows;
        const dx = cursor.x / CELL_W - x;
        const dy = cursor.y / CELL_H - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 16) {
          const influence = (1 - distance / 16) * cursor.strength;
          x += dx * influence * 0.18;
          y += dy * influence * 0.18;
        }
        ctx.globalAlpha = Math.min(1, star.alpha * twinkle);
        ctx.fillStyle = star.warm ? '#d9b58e' : '#e4edf5';
        ctx.fillText(star.glyph, x * CELL_W, y * CELL_H);
      });
      ctx.globalAlpha = 1;

      drawSolarHierarchy(secs);

      shootingStars = shootingStars.filter((meteor) => meteor.life > 0);
      shootingStars.forEach((meteor) => {
        for (let i = 0; i < 8; i += 1) {
          ctx.globalAlpha = meteor.life * (1 - i / 8) * 0.7;
          ctx.fillStyle = i === 0 ? '#f3e8d8' : '#9fc5df';
          ctx.fillText(i === 0 ? '✦' : '·', (meteor.x - meteor.vx * i) * CELL_W, (meteor.y - meteor.vy * i) * CELL_H);
        }
        meteor.x += meteor.vx;
        meteor.y += meteor.vy;
        meteor.life -= 0.016;
      });
      ctx.globalAlpha = 1;
    };

    const update = (elapsed) => {
      cursor.strength += (cursor.target - cursor.strength) * 0.12;
      const secs = elapsed / 1000;
      if (secs > nextShooter) {
        nextShooter = secs + 7 + Math.random() * 10;
        shootingStars.push({
          x: Math.random() < 0.5 ? -3 : cols + 3,
          y: Math.random() * rows * 0.42,
          vx: Math.random() < 0.5 ? 0.38 : -0.38,
          vy: 0.2 + Math.random() * 0.2,
          life: 1.8,
        });
      }
      draw(secs);
    };

    const onVisibility = () => {
      hidden = document.hidden;
      lastFrame = 0;
    };
    const onPointerMove = (event) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
      cursor.target = 1;
    };
    const onPointerLeave = () => {
      cursor.target = 0;
    };

    const loop = (time) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current || hidden) return;
      if (time - lastFrame < 1000 / TARGET_FPS) return;
      if (lastFrame) clock += (time - lastFrame) * timeScaleRef.current;
      lastFrame = time;
      update(clock);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(0);
      draw(900);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none" />;
}
