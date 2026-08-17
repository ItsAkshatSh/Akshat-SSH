/**
 * PhotographyLightbox
 * Fullscreen viewer for a single photo. Arrow keys or on-screen buttons
 * page through the collection; escape closes. Includes technical corner
 * brackets, a bottom progress bar with dots, and a discreet keyboard
 * hint. Portalled to <body> so it can sit above every other overlay.
 */
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      className={`absolute w-3 h-3 border-white/50 pointer-events-none ${anchor}`}
    />
  );
};

const PhotographyLightbox = ({ selectedImg, onClose, onSelect }) => {
  const selectedIndex = selectedImg
    ? PHOTOS.findIndex((p) => p.file === selectedImg)
    : -1;

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < PHOTOS.length) onSelect?.(PHOTOS[index].file);
    },
    [onSelect]
  );

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
      else if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImg, selectedIndex, goTo, onClose]);

  if (!selectedImg || selectedIndex < 0 || typeof document === 'undefined') return null;

  const total = PHOTOS.length;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < total - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-[#050810] flex flex-col overflow-hidden"
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
      <header className="relative flex items-center justify-between px-6 sm:px-10 py-5 shrink-0">
        <div
          className="flex items-baseline gap-3 text-[11px] font-mono uppercase tracking-[0.3em]"
          style={{
            opacity: 0,
            animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.1s',
          }}
        >
          <span className="text-white text-sm tracking-[0.22em]">
            {String(selectedIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-neutral-500">/</span>
          <span className="text-neutral-300">
            {String(total).padStart(2, '0')}
          </span>
          <span className="hidden sm:inline text-neutral-500 ml-3">Frame</span>
        </div>
        <button
          onClick={onClose}
          className="interactive h-10 px-4 rounded-full border border-white/[0.14] text-neutral-200 hover:text-white hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300 text-[11px] tracking-[0.25em] uppercase"
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
            className="interactive absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/[0.14] flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm bg-black/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}

        <img
          key={selectedImg}
          src={`/images/photography/${selectedImg}`}
          alt={`Photo ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none rounded-sm"
          draggable={false}
          style={{
            opacity: 0,
            animation:
              'lightboxImgIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.05s',
          }}
        />

        {hasNext && (
          <button
            onClick={() => goTo(selectedIndex + 1)}
            aria-label="Next photo"
            className="interactive absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/[0.14] flex items-center justify-center text-white/80 hover:text-white hover:border-white/40 hover:bg-white/[0.05] transition-all duration-300 backdrop-blur-sm bg-black/30"
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
                  ? 'w-7 bg-white/90'
                  : 'w-1.5 bg-white/25 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 border border-white/[0.14] rounded text-neutral-300 text-[10px] not-italic normal-case tracking-normal">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 border border-white/[0.14] rounded text-neutral-300 text-[10px] not-italic normal-case tracking-normal">
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
