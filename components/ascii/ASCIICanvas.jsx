import { useEffect, useRef } from 'react';

// Character ramp from dark → light (used to encode pixel brightness).
const RAMP = ' .·:-=+*x#%@';
// Glyphs used for "glitch" characters near the cursor.
const GLITCH = '!@#$%&*+=~/\\|<>[]{}?';

/**
 * Renders an image as a grid of ASCII characters, optionally in the
 * source image's own colours (`preserveColor`) and/or with a gamma
 * correction (`gamma < 1` brightens midtones).
 *
 * Performance model:
 *   - The full "resting" ASCII is rendered ONCE to an offscreen canvas
 *     (`baseCanvas`) whenever the image or grid size changes.
 *   - When the cursor isn't near, we just `drawImage(baseCanvas)` , one
 *     blit, no per-cell work.
 *   - When the cursor is near, we blit the base, clear a small bounded
 *     rectangle around the cursor, and redraw ONLY the cells inside that
 *     rectangle (usually a few hundred to a few thousand, not tens of
 *     thousands). Cells within the influence radius get displaced and
 *     occasionally glitched; cells outside the radius but inside the
 *     bounding rect draw at rest.
 *   - Off-screen instances (via IntersectionObserver) skip drawing entirely.
 */
export default function ASCIICanvas({
  src,
  cellSize = 6,
  color = '#e5e5e5',
  glitchColor = '#ffffff',
  interactive = true,
  className = '',
  radius = 90,
  displace = 12,
  fontFamily = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  fps = 30,
  preserveColor = false,
  // Gamma exponent applied to sampled brightness + RGB. < 1 brightens
  // midtones (good for dark photos), > 1 darkens them, = 1 is a no-op.
  gamma = 1,
  // When true, the canvas only renders characters *inside* the cursor
  // radius while the cursor is nearby , everywhere else stays transparent.
  scatterOnly = false,
  // When true (and preserveColor is on), the cursor-glitch characters
  // take their colour from the underlying sampled pixel instead of a
  // fixed glitchColor , so glitches match the local image hue.
  glitchUseSampled = false,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let sampled = null; // { cols, rows, b: Uint8Array, rgb?: Uint8Array }
    let width = 0;
    let height = 0;
    let currentCols = 0;
    let currentRows = 0;
    const cursor = { x: 0, y: 0, target: 0, influence: 0 };
    let raf = null;
    let running = false;
    let cancelled = false;
    let resizeRaf = null;
    let visible = true;
    let lastPaintAt = 0;
    const paintInterval = 1000 / Math.max(1, fps);
    const ctx = canvas.getContext('2d');

    // Offscreen "resting ASCII" cache. Rendered once per image/size change.
    let baseCanvas = null;
    let baseCtx = null;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${cellSize}px ${fontFamily}`;
      ctx.textBaseline = 'top';
    };

    const sampleImage = () => {
      const img = imgRef.current;
      if (!img || width < 1 || height < 1) return false;
      const cols = Math.max(1, Math.floor(width / cellSize));
      const rows = Math.max(1, Math.floor(height / cellSize));
      if (sampled && cols === currentCols && rows === currentRows) return false;
      currentCols = cols;
      currentRows = rows;

      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const octx = off.getContext('2d');
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scale = Math.max(cols / iw, rows / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cols - dw) / 2;
      const dy = (rows - dh) / 2;
      octx.fillStyle = '#000';
      octx.fillRect(0, 0, cols, rows);
      octx.drawImage(img, dx, dy, dw, dh);
      const pxData = octx.getImageData(0, 0, cols, rows).data;

      const cells = cols * rows;
      const b = new Uint8Array(cells);
      let rgb = null;
      if (preserveColor) rgb = new Uint8Array(cells * 3);

      // Precompute a gamma lookup table so we don't call Math.pow per pixel.
      const gammaLut = new Uint8Array(256);
      if (gamma === 1) {
        for (let v = 0; v < 256; v++) gammaLut[v] = v;
      } else {
        for (let v = 0; v < 256; v++) {
          gammaLut[v] = Math.min(255, Math.round(Math.pow(v / 255, gamma) * 255));
        }
      }

      for (let i = 0, j = 0; i < pxData.length; i += 4, j++) {
        const rC = pxData[i];
        const gC = pxData[i + 1];
        const bC = pxData[i + 2];
        const a = pxData[i + 3] / 255;
        const lum = (0.299 * rC + 0.587 * gC + 0.114 * bC) * a;
        b[j] = gammaLut[Math.round(lum)];
        if (rgb) {
          rgb[j * 3] = gammaLut[Math.round(rC * a)];
          rgb[j * 3 + 1] = gammaLut[Math.round(gC * a)];
          rgb[j * 3 + 2] = gammaLut[Math.round(bC * a)];
        }
      }

      sampled = { cols, rows, b, rgb };
      return true;
    };

    // Render the entire resting ASCII to `baseCanvas` , one big pass we
    // never repeat unless the source or grid changes.
    const renderBase = () => {
      if (!sampled || scatterOnly) {
        baseCanvas = null;
        baseCtx = null;
        return;
      }
      if (!baseCanvas) {
        baseCanvas = document.createElement('canvas');
        baseCtx = baseCanvas.getContext('2d');
      }
      const dpr = window.devicePixelRatio || 1;
      baseCanvas.width = Math.floor(width * dpr);
      baseCanvas.height = Math.floor(height * dpr);
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseCtx.font = `${cellSize}px ${fontFamily}`;
      baseCtx.textBaseline = 'top';
      baseCtx.clearRect(0, 0, width, height);

      const { cols, rows, b, rgb } = sampled;
      let lastKey = -1;
      if (!rgb) baseCtx.fillStyle = color;

      for (let r = 0; r < rows; r++) {
        const yPos = r * cellSize;
        for (let c = 0; c < cols; c++) {
          const cellIdx = r * cols + c;
          const bv = b[cellIdx];
          if (bv < 3) continue;
          const idx = Math.floor((bv / 255) * (RAMP.length - 1));
          const ch = RAMP[idx];
          if (ch === ' ') continue;

          if (rgb) {
            const rC = rgb[cellIdx * 3];
            const gC = rgb[cellIdx * 3 + 1];
            const bC = rgb[cellIdx * 3 + 2];
            const qr = rC & 0xf8;
            const qg = gC & 0xf8;
            const qb = bC & 0xf8;
            const key = (qr << 16) | (qg << 8) | qb;
            if (key !== lastKey) {
              baseCtx.fillStyle = `rgb(${qr},${qg},${qb})`;
              lastKey = key;
            }
          }

          baseCtx.fillText(ch, c * cellSize, yPos);
        }
      }
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      if (!sampled) return;
      const { cols, rows, b, rgb } = sampled;
      const inf = cursor.influence;
      const cx = cursor.x, cy = cursor.y;
      const R = radius;
      const R2 = R * R;
      const isReactive = inf > 0.01;

      // Non-reactive: blit the cached base and we're done.
      if (!isReactive) {
        if (scatterOnly) return;
        if (baseCanvas) ctx.drawImage(baseCanvas, 0, 0, width, height);
        return;
      }

      // Reactive: blit base first, then patch a small region around the cursor.
      if (!scatterOnly && baseCanvas) {
        ctx.drawImage(baseCanvas, 0, 0, width, height);
      }

      // Bounded region around the cursor (with padding for displacement).
      const buffer = displace + cellSize;
      const boxX0 = Math.max(0, cx - R - buffer);
      const boxY0 = Math.max(0, cy - R - buffer);
      const boxW = Math.min(width, cx + R + buffer) - boxX0;
      const boxH = Math.min(height, cy + R + buffer) - boxY0;
      const cStart = Math.max(0, Math.floor((cx - R - buffer) / cellSize));
      const cEnd = Math.min(cols, Math.floor((cx + R + buffer) / cellSize) + 1);
      const rStart = Math.max(0, Math.floor((cy - R - buffer) / cellSize));
      const rEnd = Math.min(rows, Math.floor((cy + R + buffer) / cellSize) + 1);

      // Erase the region so the redraw doesn't stack on the base.
      if (!scatterOnly && boxW > 0 && boxH > 0) {
        ctx.clearRect(boxX0, boxY0, boxW, boxH);
      }

      if (!rgb) ctx.fillStyle = color;
      let lastKey = -1;
      const glitchCells = [];

      for (let r = rStart; r < rEnd; r++) {
        for (let c = cStart; c < cEnd; c++) {
          const cellIdx = r * cols + c;
          const bv = b[cellIdx];
          if (bv < 3) continue;

          const px = c * cellSize;
          const py = r * cellSize;
          const dx = px + cellSize * 0.5 - cx;
          const dy = py + cellSize * 0.5 - cy;
          const d2 = dx * dx + dy * dy;

          if (scatterOnly && d2 > R2) continue;

          let offX = 0, offY = 0;
          let ch = null;

          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) * inf;
            offX = (dx / d) * f * displace;
            offY = (dy / d) * f * displace;
            if (Math.random() < f * 0.55) {
              ch = GLITCH[Math.floor(Math.random() * GLITCH.length)];
            }
          }

          if (ch) {
            // Stash the cell index so the glitch overlay can look up its
            // colour later when glitchUseSampled is on.
            glitchCells.push(px + offX, py + offY, ch, cellIdx);
          } else {
            const idx = Math.floor((bv / 255) * (RAMP.length - 1));
            const rc = RAMP[idx];
            if (rc === ' ') continue;
            if (rgb) {
              const rC = rgb[cellIdx * 3];
              const gC = rgb[cellIdx * 3 + 1];
              const bC = rgb[cellIdx * 3 + 2];
              const qr = rC & 0xf8;
              const qg = gC & 0xf8;
              const qb = bC & 0xf8;
              const key = (qr << 16) | (qg << 8) | qb;
              if (key !== lastKey) {
                ctx.fillStyle = `rgb(${qr},${qg},${qb})`;
                lastKey = key;
              }
            }
            ctx.fillText(rc, px + offX, py + offY);
          }
        }
      }

      if (glitchCells.length) {
        const useSampled = glitchUseSampled && rgb;
        if (!useSampled) ctx.fillStyle = glitchColor;
        let lastGlitchKey = -1;
        for (let i = 0; i < glitchCells.length; i += 4) {
          if (useSampled) {
            const gCellIdx = glitchCells[i + 3];
            // Brighten a little so the glitch still pops slightly over
            // the surrounding character.
            const rC = Math.min(255, rgb[gCellIdx * 3] + 40);
            const gC = Math.min(255, rgb[gCellIdx * 3 + 1] + 40);
            const bC = Math.min(255, rgb[gCellIdx * 3 + 2] + 40);
            const qr = rC & 0xf8;
            const qg = gC & 0xf8;
            const qb = bC & 0xf8;
            const key = (qr << 16) | (qg << 8) | qb;
            if (key !== lastGlitchKey) {
              ctx.fillStyle = `rgb(${qr},${qg},${qb})`;
              lastGlitchKey = key;
            }
          }
          ctx.fillText(glitchCells[i + 2], glitchCells[i], glitchCells[i + 1]);
        }
      }
    };

    const loop = (now) => {
      if (!visible) {
        running = false;
        return;
      }
      if (now - lastPaintAt >= paintInterval) {
        lastPaintAt = now;
        cursor.influence += (cursor.target - cursor.influence) * 0.15;
        drawFrame();
      }
      if (cursor.target > 0.01 || cursor.influence > 0.01) {
        raf = requestAnimationFrame(loop);
      } else {
        cursor.influence = 0;
        drawFrame();
        running = false;
      }
    };

    const ensureRunning = () => {
      if (!running && visible) {
        running = true;
        lastPaintAt = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const rebuild = () => {
      setupCanvas();
      const changed = sampleImage();
      if (changed) {
        renderBase();
        drawFrame();
      }
    };

    let lastRect = { w: 0, h: 0 };
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        const w = Math.floor(entry.contentRect.width);
        const h = Math.floor(entry.contentRect.height);
        if (w === lastRect.w && h === lastRect.h) return;
        lastRect = { w, h };
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(rebuild);
      });
      ro.observe(canvas);
    }

    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const wasVisible = visible;
          visible = entries[0].isIntersecting;
          if (visible && !wasVisible) {
            drawFrame();
            if (cursor.target > 0.01 || cursor.influence > 0.01) ensureRunning();
          }
        },
        { rootMargin: '80px' },
      );
      io.observe(canvas);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      rebuild();
    };
    img.onerror = () => { /* leave blank */ };
    img.src = src;

    setupCanvas();

    const onMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      cursor.x = e.clientX - rect.left;
      cursor.y = e.clientY - rect.top;
      cursor.target = 1;
      ensureRunning();
    };
    const onLeave = () => {
      if (!interactive) return;
      cursor.target = 0;
      ensureRunning();
    };
    const onTouchMove = (e) => {
      if (!interactive || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      cursor.x = e.touches[0].clientX - rect.left;
      cursor.y = e.touches[0].clientY - rect.top;
      cursor.target = 1;
      ensureRunning();
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onLeave);

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onLeave);
    };
  }, [src, cellSize, color, glitchColor, radius, displace, interactive, fontFamily, fps, preserveColor, gamma, scatterOnly, glitchUseSampled]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
