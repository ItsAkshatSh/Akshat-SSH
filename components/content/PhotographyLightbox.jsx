import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PHOTOS } from './photographyPhotos';

const PhotographyLightbox = ({ selectedImg, onClose, onSelect }) => {
  const selectedIndex = selectedImg ? PHOTOS.findIndex((p) => p.file === selectedImg) : -1;

  const goTo = useCallback(
    (index) => {
      if (index >= 0 && index < PHOTOS.length) onSelect?.(PHOTOS[index].file);
    },
    [onSelect]
  );

  useEffect(() => {
    if (!selectedImg) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [selectedImg]);

  useEffect(() => {
    if (!selectedImg) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goTo(selectedIndex + 1);
      if (e.key === 'ArrowLeft') goTo(selectedIndex - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedImg, selectedIndex, goTo]);

  if (!selectedImg || selectedIndex < 0 || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${selectedIndex + 1} of ${PHOTOS.length}`}
    >
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <p className="text-xs font-mono text-neutral-500">
          {String(selectedIndex + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
        </p>
        <button
          className="interactive p-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-all duration-300"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={22} strokeWidth={1.5} />
        </button>
      </header>

      <div className="relative flex-1 flex items-center justify-center min-h-0 px-14 sm:px-20 pb-6">
        {selectedIndex > 0 && (
          <button
            className="interactive absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            aria-label="Previous photo"
            onClick={() => goTo(selectedIndex - 1)}
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
        )}

        <img
          src={`/images/photography/${selectedImg}`}
          alt={`Photo ${selectedIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {selectedIndex < PHOTOS.length - 1 && (
          <button
            className="interactive absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
            aria-label="Next photo"
            onClick={() => goTo(selectedIndex + 1)}
          >
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PhotographyLightbox;
