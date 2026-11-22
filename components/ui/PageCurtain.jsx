/**
 * PageCurtain
 *
 * The full-screen label wipe used when a menu item opens a panel, hoisted out
 * of the menu itself. Section panels only swap content on the same route, so
 * their curtain can live inside FloatingMenu; a route change (Blog) unmounts
 * the menu, which would cut the animation off mid-flight. This one is mounted
 * once in _app, above the page, so it can stay up while the next page paints
 * underneath it.
 *
 * Usage: dispatch the `page-transition` event with a label (and optional
 * image) before navigating; the curtain holds for HOLD_MS and then wipes away.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

// Long enough for the cover/label to land before the wipe lifts, short enough
// that the destination is interactive by ~1s.
const HOLD_MS = 620;

/** Fire the curtain from anywhere: beginPageTransition({ label: 'Blog' }). */
export function beginPageTransition(detail) {
  if (typeof window === 'undefined' || !detail?.label) return;
  window.dispatchEvent(new CustomEvent('page-transition', { detail }));
}

export default function PageCurtain() {
  const [curtain, setCurtain] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onStart = (event) => {
      const { label, image = null } = event.detail || {};
      if (!label) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurtain({ label, image });
      timerRef.current = window.setTimeout(() => setCurtain(null), HOLD_MS);
    };
    window.addEventListener('page-transition', onStart);
    return () => {
      window.removeEventListener('page-transition', onStart);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {curtain && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-nav flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          style={{ backgroundColor: 'var(--bg)' }}
          aria-hidden="true"
        >
          <motion.span
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-center font-display text-[clamp(4.4rem,15vw,14rem)] leading-none tracking-[-0.08em] text-bone/90"
            initial={{ opacity: 0, scale: 1.16, letterSpacing: '-0.16em' }}
            animate={{ opacity: 0.92, scale: 1, letterSpacing: '-0.08em' }}
            transition={{ duration: 0.72, ease }}
          >
            {curtain.label}
          </motion.span>
          {curtain.image && (
            <motion.div
              className="relative z-10 h-[38vh] w-[min(38vw,420px)] min-w-[220px] overflow-hidden bg-surface"
              initial={{ opacity: 0, scale: 0.24, filter: 'saturate(0.2) contrast(0.8)' }}
              animate={{ opacity: 1, scale: 1, filter: 'saturate(1) contrast(1)' }}
              transition={{ duration: 0.82, ease }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={curtain.image}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
