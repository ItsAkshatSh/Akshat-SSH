/**
 * SharedElementGallery
 * Masonry gallery with a shared-element (Framer Motion `layoutId`)
 * transition into a fullscreen lightbox. Physics-based spring, drag-
 * to-dismiss, frosted backdrop.
 *
 * Adapted from a TSX shadcn reference to plain JSX for this project:
 *   - lucide-react `X` swapped for an inline SVG
 *   - `cn` inlined (no @/lib/utils dependency)
 *   - `caption` prop added so photos can carry date / place metadata
 *     that appears when expanded
 */
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...args) => args.filter(Boolean).join(' ');

const CloseIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const spring = { type: 'spring', stiffness: 350, damping: 35, mass: 1 };

const GalleryContext = React.createContext(null);

/** Root provider. Owns the currently-expanded image and mounts the modal. */
export function Gallery({ children }) {
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  React.useEffect(() => {
    if (selected) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selected]);

  return (
    <GalleryContext.Provider value={{ selected, setSelected }}>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  );
}

/** Responsive masonry container. */
export function GalleryGrid({ children, className }) {
  return (
    <div
      className={cn(
        'columns-1 sm:columns-2 lg:columns-3 gap-3 md:gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

/** One thumbnail tile. `id` must be stable and unique across the grid so
 *  the shared-element transition maps thumbnail → modal cleanly. */
export function GalleryImage({ src, alt, id, caption, className }) {
  const ctx = React.useContext(GalleryContext);
  if (!ctx) throw new Error('GalleryImage must be used inside <Gallery>');

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      className={cn(
        'interactive relative mb-3 md:mb-4 break-inside-avoid cursor-zoom-in rounded-lg overflow-hidden bg-[#0a0a0a]',
        className
      )}
      onClick={() => ctx.setSelected({ id, src, alt, caption })}
    >
      <motion.img
        layoutId={`image-${id}`}
        src={src}
        alt={alt || ''}
        loading="lazy"
        draggable={false}
        className="w-full h-auto object-cover rounded-lg select-none"
        variants={{ hover: { scale: 0.985 }, tap: { scale: 0.95 } }}
        transition={spring}
      />
      <motion.div
        variants={{ hover: { opacity: 1 }, tap: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/20 pointer-events-none rounded-lg"
      />
    </motion.div>
  );
}

/** Expanded viewer. Drag vertically past a threshold to dismiss. */
function GalleryModal() {
  const ctx = React.useContext(GalleryContext);
  if (!ctx) return null;
  const { selected, setSelected } = ctx;

  return (
    <AnimatePresence>
      {selected && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          {/* Frosted backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={() => setSelected(null)}
          />

          {/* Drag container */}
          <motion.div
            className="relative z-10 w-full h-full flex flex-col items-center justify-center cursor-zoom-out px-6"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(e, info) => {
              if (
                Math.abs(info.offset.y) > 100 ||
                Math.abs(info.velocity.y) > 300
              ) {
                setSelected(null);
              }
            }}
            onClick={() => setSelected(null)}
          >
            <motion.img
              layoutId={`image-${selected.id}`}
              src={selected.src}
              alt={selected.alt || ''}
              className="w-auto h-auto max-w-[95vw] max-h-[82vh] rounded-lg shadow-2xl object-contain will-change-transform"
              draggable={false}
              transition={spring}
            />

            {/* Caption (date / place) fades in after the image lands. */}
            {selected.caption && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.18, duration: 0.32 }}
                className="mt-6 flex items-baseline gap-3 sm:gap-5 text-[11px] font-mono uppercase tracking-[0.28em] pointer-events-none"
                onClick={(e) => e.stopPropagation()}
              >
                {selected.caption.date && (
                  <span className="text-white">{selected.caption.date}</span>
                )}
                {selected.caption.date && selected.caption.place && (
                  <span className="text-white/30">·</span>
                )}
                {selected.caption.place && (
                  <span className="text-neutral-300">{selected.caption.place}</span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="interactive absolute top-6 right-6 z-[400] w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
            onClick={() => setSelected(null)}
            aria-label="Close photo"
          >
            <CloseIcon className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
