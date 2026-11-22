/**
 * PhotoScrollGallery
 * Infinite horizontal marquee of photographs. Frames are identical 4:5 macOS
 * windows with a single frosted filename line; the strip drifts on its own and
 * nearly stops under the pointer so a frame can be clicked. Hovering replaces
 * the native pointer with a tinted arrow and that photo's place; clicking
 * morphs the frame open into the lightbox.
 */
'use client';

import { useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { createPortal } from 'react-dom';
import PhotoCursor from '../ui/PhotoCursor';
import { InfiniteSlider } from '../ui/InfiniteSlider';

const SCROLL_SPEED = 18;
const SCROLL_SPEED_HOVER = 4;

const EDGE_FADE =
  'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)';

const PhotoScrollGallery = ({ photos, onSelect }) => {
  const [hovered, setHovered] = useState(null);

  // The replacement pointer tracks the real one through motion values so it
  // costs no React renders while moving.
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  // Hand the clicked window's rect to the lightbox so it can morph open from
  // the exact frame the visitor tapped, not from the middle of the screen.
  const handleSelect = (file, frame) => {
    setHovered(null);
    const rect = frame?.getBoundingClientRect();
    onSelect?.(
      file,
      rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-col justify-center overflow-hidden select-none"
      onPointerMove={(event) => {
        cursorX.set(event.clientX);
        cursorY.set(event.clientY);
      }}
      onPointerLeave={() => setHovered(null)}
      role="region"
      aria-label="Photography gallery. Photographs scroll continuously."
      aria-roledescription="carousel"
    >
      <div
        className="w-full"
        style={{ height: 'min(72vh, 640px, 90vw)' }}
      >
        <InfiniteSlider
          className="h-full w-full"
          gap={20}
          speed={SCROLL_SPEED}
          speedOnHover={SCROLL_SPEED_HOVER}
          style={{
            maskImage: EDGE_FADE,
            WebkitMaskImage: EDGE_FADE,
          }}
        >
          {(copy) => photos.map((photo, index) => (
            <button
              key={`${photo.file}-${copy}`}
              type="button"
              // The marquee's second half is the same frame repeated so the
              // loop is seamless. It still has to be tappable, but it should
              // not double the tab stops.
              tabIndex={copy === 1 ? -1 : undefined}
              className="photo-window interactive group relative h-full shrink-0 aspect-[4/5] cursor-none overflow-hidden rounded-[14px] bg-surface outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--accent)] focus-visible:outline-offset-4"
              style={{
                boxShadow:
                  '0 24px 60px -22px rgba(0, 0, 0, 0.85), 0 6px 18px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
              }}
              onClick={(event) => handleSelect(photo.file, event.currentTarget)}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return;
                cursorX.set(event.clientX);
                cursorY.set(event.clientY);
                setHovered({ color: photo.accent, label: photo.place });
              }}
              onPointerLeave={() => setHovered(null)}
              aria-label={`${photo.place}, ${photo.date}. Open photo ${index + 1} of ${photos.length}`}
            >
              {/* Frosted filename line */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-[2] flex h-8 items-center justify-center border-b border-white/[0.07] px-3"
                style={{
                  background: 'rgba(28, 22, 17, 0.5)',
                  backdropFilter: 'blur(18px) saturate(1.3)',
                  WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
                }}
              >
                <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.22em] text-bone/45">
                  {photo.file}
                </span>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/photography/${photo.file}`}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 block h-full w-full object-cover"
                loading={index < 4 ? 'eager' : 'lazy'}
              />

              {/* Hover lift: brightness only, so every frame keeps its size */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px ${photo.accent}55`,
                }}
              />
            </button>
          ))}
        </InfiniteSlider>
      </div>

      <div className="pointer-events-none absolute inset-x-6 sm:inset-x-10 top-6 sm:top-8 z-chrome">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Visual archive</p>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <PhotoCursor
            x={cursorX}
            y={cursorY}
            color={hovered?.color}
            label={hovered?.label}
            active={Boolean(hovered)}
          />,
          document.body
        )}
    </div>
  );
};

export default PhotoScrollGallery;
