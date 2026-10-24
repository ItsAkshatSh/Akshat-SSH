/**
 * PhotoScrollGallery
 * Photoyoshi-inspired infinite horizontal strip: vertical wheel / trackpad
 * and drag drive horizontal travel; scroll velocity skews frames and
 * parallax-shifts the image inside each frame. Click opens a lightbox.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useDrag } from '@use-gesture/react';

const LERP = 0.085;
const FRICTION = 0.92;
const MAX_SKEW = 7;
const MAX_PARALLAX = 28;
const WHEEL_GAIN = 1.15;
const DRAG_GAIN = 1.35;
const INTRO_NUDGE = 140;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function wrap(n, period) {
  if (!period) return 0;
  return ((n % period) + period) % period;
}

const PhotoScrollGallery = ({ photos, onSelect }) => {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const frameRefs = useRef([]);
  const imgRefs = useRef([]);

  const state = useRef({
    x: 0,
    target: 0,
    vel: 0,
    period: 0,
    dragging: false,
    raf: 0,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [introActive, setIntroActive] = useState(!reducedMotion);
  const hintRef = useRef(true);

  // Duplicate the strip so wrapping never shows a gap.
  const strip = [...photos, ...photos];

  const measure = useCallback(() => {
    const first = frameRefs.current[0];
    const twin = frameRefs.current[photos.length];
    if (!first || !twin) return;
    // Distance from a frame to its duplicate — exact loop period.
    state.current.period = twin.offsetLeft - first.offsetLeft;
  }, [photos.length]);

  const applyTransforms = useCallback(() => {
    const { x, vel, period } = state.current;
    const track = trackRef.current;
    if (!track || !period) return;

    const drawn = -wrap(x, period);
    track.style.transform = `translate3d(${drawn}px, -50%, 0)`;

    const skew = reducedMotion ? 0 : clamp(-vel * 0.045, -MAX_SKEW, MAX_SKEW);
    const parallax = reducedMotion ? 0 : clamp(vel * 0.12, -MAX_PARALLAX, MAX_PARALLAX);

    for (let i = 0; i < frameRefs.current.length; i++) {
      const frame = frameRefs.current[i];
      const img = imgRefs.current[i];
      if (!frame) continue;
      const rect = frame.getBoundingClientRect();
      const rootRect = rootRef.current?.getBoundingClientRect();
      const centre = rootRect ? rootRect.left + rootRect.width / 2 : window.innerWidth / 2;
      const distance = rootRect ? Math.abs(rect.left + rect.width / 2 - centre) / rootRect.width : 0;
      const focus = clamp(1 - distance * 1.8, 0, 1);
      const offset = Math.sin(i * 1.7) * 18;
      frame.style.transform = `translate3d(0, ${offset * (1 - focus)}px, 0) skewX(${skew * (0.35 + focus * 0.65)}deg) scale(${0.92 + focus * 0.08})`;
      frame.style.opacity = `${0.45 + focus * 0.55}`;
      if (img) {
        img.style.transform = `translate3d(${parallax * (1 - focus * 0.35)}px, 0, 0) scale(${1.08 + focus * 0.035})`;
      }
    }

    // Nearest photo to viewport centre → index into original set.
    const root = rootRef.current;
    if (root) {
      const centre = root.getBoundingClientRect().left + root.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < photos.length; i++) {
        const el = frameRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const d = Math.abs(mid - centre);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setActiveIndex((prev) => (prev === best ? prev : best));
    }
  }, [photos.length, reducedMotion]);

  const tick = useCallback(() => {
    const s = state.current;
    if (!s.period) measure();
    if (!s.dragging) {
      // Coast with friction, then ease toward settled target.
      if (Math.abs(s.vel) > 0.08) {
        s.vel *= FRICTION;
        s.target += s.vel;
      }
      s.x += (s.target - s.x) * (reducedMotion ? 1 : LERP);
      if (Math.abs(s.target - s.x) < 0.05 && Math.abs(s.vel) < 0.08) {
        s.x = s.target;
        s.vel = 0;
      }
    } else {
      s.x = s.target;
    }

    // Keep numbers bounded so we never float-precision drift.
    if (s.period > 0 && (s.x > s.period * 3 || s.x < -s.period)) {
      const wrapped = wrap(s.x, s.period);
      const delta = wrapped - s.x;
      s.x = wrapped;
      s.target += delta;
    }

    applyTransforms();
    s.raf = requestAnimationFrame(tick);
  }, [applyTransforms, measure, reducedMotion]);

  useEffect(() => {
    measure();
    setReady(true);
    const s = state.current;
    s.raf = requestAnimationFrame(tick);

    const onResize = () => measure();
    window.addEventListener('resize', onResize);

    // Intro nudge so visitors feel the horizontal direction (photoyoshi UI tip).
    let introTimer;
    if (!reducedMotion) {
      introTimer = window.setTimeout(() => {
        if (hintRef.current) s.target += INTRO_NUDGE;
      }, 700);
    }
    const revealTimer = window.setTimeout(() => setIntroActive(false), reducedMotion ? 0 : 1900);

    return () => {
      cancelAnimationFrame(s.raf);
      window.removeEventListener('resize', onResize);
      if (introTimer) clearTimeout(introTimer);
      clearTimeout(revealTimer);
    };
  }, [tick, measure, reducedMotion]);

  // Re-measure once images load (widths may change).
  useEffect(() => {
    const imgs = imgRefs.current.filter(Boolean);
    const onLoad = () => measure();
    imgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', onLoad);
    });
    return () => imgs.forEach((img) => img.removeEventListener('load', onLoad));
  }, [measure, photos]);

  const dismissHint = useCallback(() => {
    hintRef.current = false;
    setHintVisible(false);
  }, []);

  const pushDelta = useCallback(
    (dx) => {
      const s = state.current;
      s.target += dx;
      s.vel = dx;
      dismissHint();
    },
    [dismissHint]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onWheel = (e) => {
      // Prefer the dominant axis so trackpads feel natural.
      const dominant =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (dominant === 0) return;
      e.preventDefault();
      pushDelta(dominant * WHEEL_GAIN);
    };

    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, [pushDelta]);

  const bind = useDrag(
    ({ active, delta: [ddx], last, velocity: [vx], direction: [dirX], tap }) => {
      const s = state.current;
      if (tap) return;
      s.dragging = active;
      dismissHint();
      // Dragging left advances the strip (same sense as wheel-down).
      const step = -ddx * DRAG_GAIN;
      s.target += step;
      s.vel = step;
      if (last) {
        s.dragging = false;
        s.vel = -dirX * vx * 22;
        s.target += s.vel * 5;
      }
    },
    { filterTaps: true, axis: 'x', pointer: { touch: true } }
  );

  const handleSelect = (file) => {
    onSelect?.(file);
  };

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden select-none touch-none"
      style={{ cursor: 'grab', opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
      {...bind()}
      role="region"
      aria-label="Photography gallery. Scroll or drag horizontally."
      aria-roledescription="carousel"
    >
      {introActive && (
        <div className="photography-intro absolute inset-0 z-overlay flex flex-col items-center justify-center overflow-hidden bg-[color:var(--bg)]">
          <div className="photography-intro__wordmark pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-center font-display text-[clamp(4.4rem,15vw,14rem)] leading-none tracking-[-0.08em] text-bone/90">
            PHOTOGRAPHY
          </div>
          <div className="photography-intro__frame relative z-10 h-[38vh] w-[min(38vw,420px)] min-w-[220px] overflow-hidden bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/photography/${photos[1]?.file || photos[0]?.file}`}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Soft edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-content w-10 sm:w-20"
        style={{
          background:
            'linear-gradient(to right, color-mix(in oklab, var(--bg) 85%, transparent), transparent)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-content w-10 sm:w-20"
        style={{
          background:
            'linear-gradient(to left, color-mix(in oklab, var(--bg) 85%, transparent), transparent)',
        }}
      />

      <div
        ref={trackRef}
        className="absolute top-1/2 left-0 flex items-center gap-4 sm:gap-6 md:gap-8 will-change-transform px-[12vw] sm:px-[18vw]"
        style={{
          transform: 'translate3d(0, -50%, 0)',
          height: 'min(72vh, 640px)',
        }}
      >
        {strip.map((photo, i) => {
          const originalIndex = i % photos.length;
          return (
            <button
              key={`${photo.file}-${i}`}
              type="button"
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
              className="interactive relative shrink-0 h-full overflow-hidden rounded-sm bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-4"
              style={{
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
              onClick={() => handleSelect(photo.file)}
              aria-label={`${photo.place}, ${photo.date}. Open photo ${originalIndex + 1} of ${photos.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => {
                  imgRefs.current[i] = el;
                }}
                src={`/images/photography/${photo.file}`}
                alt=""
                draggable={false}
                className="pointer-events-none block h-full w-auto max-w-[min(78vw,520px)] object-cover"
                style={{
                  transform: 'translate3d(0, 0, 0) scale(1.08)',
                  willChange: 'transform',
                }}
                loading={i < 4 ? 'eager' : 'lazy'}
              />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-6 sm:inset-x-10 top-6 sm:top-8 z-chrome flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent">Visual archive</p>
        </div>
      </div>

      {/* Index + caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-8 z-chrome flex flex-col items-center gap-2 px-6">
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-muted-warm">
          {String(activeIndex + 1).padStart(2, '0')}
          <span className="mx-2 opacity-40">/</span>
          {String(photos.length).padStart(2, '0')}
        </p>
        <p className="font-display text-sm sm:text-base text-bone/90 tracking-wide">
          {photos[activeIndex]?.place}
          <span className="mx-2 text-muted-warm/50">·</span>
          <span className="text-muted-warm">{photos[activeIndex]?.date}</span>
        </p>
      </div>

      {/* First-visit scroll hint */}
      {hintVisible && !reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[18%] z-chrome flex justify-center"
          style={{ animation: 'slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s', opacity: 0 }}
        >
          <div className="flex items-center gap-3 text-muted-warm">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Scroll</span>
            <span
              className="inline-block h-px w-10 bg-current opacity-50"
              style={{ animation: 'photoScrollHint 1.6s ease-in-out infinite' }}
            />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase">or drag</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoScrollGallery;
