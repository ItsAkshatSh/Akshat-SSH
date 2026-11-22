/**
 * InfiniteSlider
 * Seamless horizontal marquee. The children are rendered twice; the track is
 * translated by rAF until one full set has passed, then wrapped, so there is
 * no jump and no width bookkeeping at the call site. `speedOnHover` (px/s)
 * takes over from `speed` while the pointer is inside.
 */
'use client';

import { Children, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

export function InfiniteSlider({
  children,
  className = '',
  gap = 16,
  speed = 40,
  speedOnHover,
  ...props
}) {
  // Children may be a render function so the caller can tell the visual twin
  // apart (e.g. to keep its items out of the tab order) without the slider
  // knowing anything about the items.
  const renderCopy = (copy) =>
    typeof children === 'function' ? children(copy) : Children.toArray(children);
  const trackRef = useRef(null);
  const hoveredRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reducedMotion) return undefined;

    let offset = 0;
    let raf = 0;
    let last = performance.now();

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const velocity = hoveredRef.current && speedOnHover ? speedOnHover : speed;
      offset -= velocity * dt;

      // One copy of the children is exactly half the track, so wrapping there
      // lands on a pixel-identical frame.
      const half = track.scrollWidth / 2;
      if (half > 0 && -offset >= half) offset += half;

      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed, speedOnHover, reducedMotion]);

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      onPointerEnter={() => {
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        hoveredRef.current = false;
      }}
      {...props}
    >
      <div ref={trackRef} className="flex h-full w-max will-change-transform">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            // The second copy is a visual twin: hidden from assistive tech and,
            // when the render function says so, out of the tab order.
            aria-hidden={copy === 1 ? 'true' : undefined}
            className="flex h-full shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {renderCopy(copy)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfiniteSlider;
