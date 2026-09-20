/**
 * CoverflowCarousel
 * 3D coverflow-style carousel. Fractional card position is the single
 * source of truth; transforms are applied straight to the DOM inside a
 * rAF loop so 60 fps travel doesn't re-render every card.
 *
 * Adapted from a TSX shadcn reference to plain JSX for this project:
 *   - lucide-react icons swapped for inline SVGs
 *   - `cn` helper inlined (no @/lib/utils dependency)
 *   - added `onSelect` callback for click-to-open behaviour
 */
'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

// --- Motion model -----------------------------------------------------------
// Critically damped (damping ratio 1.0): nothing here is thrown hard enough to
// justify overshoot, and a card that bounces past its snap point reads as a
// mistake rather than as momentum. `response` is Apple's parameter — the time
// in seconds the value takes to reach its target.
const RESPONSE = 0.4;
const OMEGA = (2 * Math.PI) / RESPONSE;

// Momentum projection, in Apple's exponential-decay form rather than the
// textbook v²/2a: how far the flick *would* have travelled. The snap target is
// then chosen from that projected landing point, so a flick ends up where the
// gesture was heading instead of where the finger happened to stop.
const DECELERATION = 0.998;
const project = (velocity) =>
  ((velocity / 1000) * DECELERATION) / (1 - DECELERATION);

// The ring loops, so an unbounded projection could spin the whole set.
const MAX_THROW = 3;
// Velocity is read from a short trailing window, not the final sample.
const VELOCITY_WINDOW_MS = 100;

const ChevronLeft = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = 'clamp(148px, 22vw, 260px)',
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = 'Cover carousel',
  className,
  cardClassName,
  renderCaption,
  onSelect,
}) {
  const count = slides.length;
  const frameRef = React.useRef(null);
  const cardRefs = React.useRef([]);

  // Fractional card index at the centre. The single source of truth.
  const posRef = React.useRef(0);
  // Target of the current settle. Stepping off `pos` instead would swallow
  // a keypress that lands mid-flight.
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const [selected, setSelected] = React.useState(0);

  // Nearest whole card, folded into 0..count-1.
  const indexAt = React.useCallback(
    (pos) => ((Math.round(pos) % count) + count) % count,
    [count]
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      // Fold distance into the shorter way around the ring — the whole
      // looping mechanism, no cloned nodes.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }
      const distance = Math.abs(offset);
      // Both tilt and recession ease off with distance.
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // Cards teleport across the ring at half a turn out; fade to hide it.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  // Critically damped spring, solved analytically so the motion is identical
  // at 60Hz and 120Hz — a per-frame `pos += remaining * k` step (the previous
  // approach) settles twice as fast on a ProMotion display.
  //
  // `initialVelocity` is in cards/second and is the whole point: it lets the
  // cards continue at the finger's release speed, so there is no seam between
  // dragging and animating. Once the spring is running, a new pointer-down
  // cancels it and the drag picks up from `posRef`, which is always the live
  // value on screen rather than the logical target.
  const settle = React.useCallback(
    (target, initialVelocity = 0) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const from = posRef.current;
      const a = from - target;
      const b = initialVelocity + OMEGA * a;
      const t0 = performance.now();

      const step = (now) => {
        const t = Math.max(0, (now - t0) / 1000);
        const decay = Math.exp(-OMEGA * t);
        const x = target + (a + b * t) * decay;
        const v = (b - OMEGA * (a + b * t)) * decay;

        posRef.current = x;
        paint();

        if (Math.abs(x - target) < 0.0005 && Math.abs(v) < 0.004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint]
  );

  const clamp = React.useCallback(
    (pos) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop]
  );

  const goTo = React.useCallback(
    (index) => {
      // Shorter way around instead of unwinding the whole ring.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle]
  );

  const nudge = React.useCallback(
    (by) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle]
  );

  const onPointerDown = (event) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      samples: [{ t: performance.now(), pos: posRef.current }],
      moved: false,
    };
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;
    const now = performance.now();
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > 3) drag.moved = true;
    posRef.current = clamp(drag.pos - dx / pitch);

    // Keep a trailing window of positions. Velocity read at release from the
    // oldest sample in that window is far steadier than the last frame alone:
    // a finger that pauses before lifting yields 0 rather than a stale throw,
    // and a fast flick is not under-read by one noisy sample.
    drag.samples.push({ t: now, pos: posRef.current });
    while (
      drag.samples.length > 2 &&
      now - drag.samples[0].t > VELOCITY_WINDOW_MS
    ) {
      drag.samples.shift();
    }

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;

    const samples = drag.samples;
    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = last.t - first.t;
    // Cards per second, straight off the window above.
    const velocity = dt > 0 ? (last.pos - first.pos) / (dt / 1000) : 0;

    // Below this the gesture was a placement, not a throw: land on the nearest
    // card without projecting a stray drift out of rounding noise.
    const throwDistance =
      Math.abs(velocity) < 0.05
        ? 0
        : Math.max(-MAX_THROW, Math.min(MAX_THROW, project(velocity)));

    settle(clamp(Math.round(posRef.current + throwDistance)), velocity);
  };

  const onCardClick = (index, event) => {
    // Swallow the click that ended a drag so it doesn't fire onSelect.
    if (dragRef.current === null) {
      const wasDrag = event && event.detail === 0;
      if (wasDrag) return;
    }
    if (index === selected) {
      onSelect?.(slides[index], index);
    } else {
      goTo(index);
    }
  };

  // Card width drives pitch, depth and perspective — the only thing worth
  // measuring, and only when the box actually changes.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const active = slides[selected];

  return (
    <div
      className={cn('w-full', className)}
      style={{ '--cf-card': cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              nudge(1);
            } else if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect?.(slides[selected], selected);
            }
          }}
          className="cursor-grab overflow-hidden py-10 outline-none focus-visible:ring-1 focus-visible:ring-white/40 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            touchAction: 'pan-y',
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: 'var(--cf-card)',
              transformStyle: 'preserve-3d',
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                onClick={(e) => onCardClick(index, e)}
                className={cn(
                  'absolute left-1/2 top-0 aspect-square overflow-hidden rounded-lg bg-[#0a0a0a] shadow-2xl cursor-pointer',
                  cardClassName
                )}
                style={{ width: 'var(--cf-card)' }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  className="h-full w-full select-none object-cover pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="interactive absolute left-3 top-1/2 z-nav -translate-y-1/2 size-11 rounded-full border border-white/[0.14] text-white/80 hover:text-white hover:border-white/40 hover:bg-white/[0.05] backdrop-blur-sm bg-black/30 transition-all duration-300 active:duration-100 active:scale-90 flex items-center justify-center"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="interactive absolute right-3 top-1/2 z-nav -translate-y-1/2 size-11 rounded-full border border-white/[0.14] text-white/80 hover:text-white hover:border-white/40 hover:bg-white/[0.05] backdrop-blur-sm bg-black/30 transition-all duration-300 active:duration-100 active:scale-90 flex items-center justify-center"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active && (
        <div
          key={selected}
          className="mt-4 flex flex-col items-center px-6"
          style={{
            animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {renderCaption ? renderCaption(active, selected, count) : null}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                'interactive h-1.5 rounded-full transition-all duration-300',
                index === selected ? 'w-6 bg-white/90' : 'w-1.5 bg-white/30 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
