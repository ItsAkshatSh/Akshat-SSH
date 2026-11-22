/**
 * PhotographyLightbox
 * Fullscreen viewer for a single photo. Arrow keys or on-screen buttons
 * page through the collection; escape closes. Includes technical corner
 * brackets, a bottom progress bar with dots, and a discreet keyboard
 * hint. Portalled to <body> so it can sit above every other overlay.
 *
 * Opening a photo morphs it out of the frame that was clicked (FLIP: the
 * viewer's image is scaled/translated from the frame's rect to its resting
 * spot). Both rects share the photo's aspect ratio, so the flight is a clean
 * uniform scale with no distortion.
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { PHOTOS } from './photographyPhotos';

const CornerMark = ({ position }) => {
  const anchor = {
    tl: 'top-4 left-4 border-t border-l',
    tr: 'top-4 right-4 border-t border-r',
    bl: 'bottom-4 left-4 border-b border-l',
    br: 'bottom-4 right-4 border-b border-r',
  }[position];
  return (
    <span
      aria-hidden="true"
      className={`absolute w-3 h-3 border-[color:var(--border-hover)] pointer-events-none ${anchor}`}
    />
  );
};

const PhotographyLightbox = ({ selectedImg, originRect, onClose, onSelect }) => {
  const selectedIndex = selectedImg
    ? PHOTOS.findIndex((p) => p.file === selectedImg)
    : -1;

  const imgRef = useRef(null);
  const imgControls = useAnimationControls();
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!selectedImg) return;
    const img = imgRef.current;
    if (!img) return;

    const hasOrigin = originRect?.width > 0 && originRect?.height > 0;
    if (reducedMotion || !hasOrigin) {
      imgControls.set({ x: 0, y: 0, scale: 1, opacity: 1, borderRadius: 4 });
      return;
    }

    const target = img.getBoundingClientRect();
    if (!target.width) return;

    const scale = originRect.width / target.width;
    imgControls.set({
      x: originRect.left + originRect.width / 2 - (target.left + target.width / 2),
      y: originRect.top + originRect.height / 2 - (target.top + target.height / 2),
      scale,
      opacity: 1,
      // Radius is drawn under the scale, so divide to land on the frame's
      // visible 14px corners at the start of the flight.
      borderRadius: Math.min(48, 14 / scale),
    });
    imgControls.start({
      x: 0,
      y: 0,
      scale: 1,
      borderRadius: 4,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    });
  }, [selectedImg, originRect, imgControls, reducedMotion]);

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < PHOTOS.length) onSelect?.(PHOTOS[index].file);
    },
    [onSelect]
  );

  // Close by flying the photo back into the frame it came from, then dismiss.
  // Without an origin (opened by keyboard paging, reduced motion) it is a
  // plain dismiss.
  const closingRef = useRef(false);
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const img = imgRef.current;
    const hasOrigin = originRect?.width > 0 && originRect?.height > 0;
    if (reducedMotion || !hasOrigin || !img) {
      onClose?.();
      return;
    }
    const target = img.getBoundingClientRect();
    if (!target.width) {
      onClose?.();
      return;
    }
    closingRef.current = true;
    const scale = originRect.width / target.width;
    imgControls
      .start({
        x: originRect.left + originRect.width / 2 - (target.left + target.width / 2),
        y: originRect.top + originRect.height / 2 - (target.top + target.height / 2),
        scale,
        borderRadius: Math.min(48, 14 / scale),
        transition: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
      })
      .then(() => onClose?.());
  }, [originRect, reducedMotion, imgControls, onClose]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!selectedImg) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedImg]);

  // Keyboard controls.
  useEffect(() => {
    if (!selectedImg) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goTo(selectedIndex + 1);
      else if (e.key === 'ArrowLeft') goTo(selectedIndex - 1);
      else if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImg, selectedIndex, goTo, requestClose]);

  if (!selectedImg || selectedIndex < 0 || typeof document === 'undefined') return null;

  const total = PHOTOS.length;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < total - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-lightbox bg-ink flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${selectedIndex + 1} of ${total}`}
      style={{ animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      <CornerMark position="tl" />
      <CornerMark position="tr" />
      <CornerMark position="bl" />
      <CornerMark position="br" />

      {/* Top bar: index + close */}
      <header className="safe-t safe-l safe-r relative flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
        <div
          className="flex items-baseline gap-3 text-[11px] font-mono uppercase tracking-[0.3em] tabular-nums"
          style={{
            opacity: 0,
            animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s',
          }}
        >
          <span className="text-bone text-sm tracking-[0.22em]">
            {String(selectedIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-muted-warm">/</span>
          <span className="text-muted-warm">
            {String(total).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline text-muted-warm ml-3">Frame</span>
        </div>
        <button
          onClick={requestClose}
          className="interactive press h-10 px-4 rounded-full border border-hair text-bone hover:text-bone hover:border-[color:var(--border-hover)] hover:bg-surface-raised text-[11px] tracking-[0.25em] uppercase"
          aria-label="Close"
          style={{
            opacity: 0,
            animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s',
          }}
        >
          Close
        </button>
      </header>

      {/* Photo stage */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-4 sm:px-10 pb-4">
        {hasPrev && (
          <button
            onClick={() => goTo(selectedIndex - 1)}
            aria-label="Previous photo"
            className="interactive absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-content size-11 sm:size-12 rounded-full border border-hair flex items-center justify-center text-bone/80 hover:text-bone hover:border-[color:var(--border-hover)] hover:bg-surface-raised transition-all duration-300 active:duration-100 active:scale-90 backdrop-blur-sm bg-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}

        <motion.img
          key={selectedImg}
          ref={imgRef}
          src={`/images/photography/${selectedImg}`}
          alt={`Photo ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
          initial={{ opacity: 0 }}
          animate={imgControls}
        />

        {hasNext && (
          <button
            onClick={() => goTo(selectedIndex + 1)}
            aria-label="Next photo"
            className="interactive absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-content size-11 sm:size-12 rounded-full border border-hair flex items-center justify-center text-bone/80 hover:text-bone hover:border-[color:var(--border-hover)] hover:bg-surface-raised transition-all duration-300 active:duration-100 active:scale-90 backdrop-blur-sm bg-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom rail: progress dots + hint */}
      <footer
        className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-10 pb-6 pt-2 shrink-0"
        style={{
          opacity: 0,
          animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s',
        }}
      >
        <div
          className="flex items-center gap-1.5 flex-wrap justify-center max-w-full"
          role="tablist"
          aria-label="Photo navigation"
        >
          {PHOTOS.map((p, i) => (
            <button
              key={p.file}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === selectedIndex}
              aria-label={`Go to photo ${i + 1}`}
              className={`interactive h-1.5 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'w-7 bg-bone'
                  : 'w-1.5 bg-bone/25 hover:bg-bone/60'
              }`}
            />
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-warm">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 border border-hair rounded text-muted-warm text-[11px] not-italic normal-case tracking-normal">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 border border-hair rounded text-muted-warm text-[11px] not-italic normal-case tracking-normal">
              →
            </kbd>
            <span>Navigate</span>
          </span>
        </div>
      </footer>
    </div>,
    document.body
  );
};

export default PhotographyLightbox;
