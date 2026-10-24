/**
 * BackgroundField
 * Owns the living background and applies the user's settings — background
 * world (Orbit / Ocean) and scene motion level — from the shared
 * settingsStore. The quick bottom-right toggle and the Settings panel both
 * write to the store, so the two stay in sync live, and the choice persists.
 *
 * Exactly one scene is ever mounted; the swap is lazy with a crossfade, so
 * the hidden world costs zero GPU.
 */
import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings, BG_MODES, MOTION_SCALE } from '../lib/settingsStore';

const InkField = lazy(() => import('./ink/InkField'));
const ASCIIOceanField = lazy(() => import('./ascii/ASCIIField'));

export default function BackgroundField({ paused = false }) {
  const { bgMode, motionLevel } = useSettings();
  const scale = MOTION_SCALE[motionLevel];

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={bgMode}
          className="fixed inset-0 z-ocean pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Suspense stays empty while the world's chunk loads: the page ink
              is the backdrop, so arrival reads as a fade-in, not a blank. */}
          <Suspense fallback={null}>
            {bgMode === BG_MODES.void ? (
              <InkField paused={paused} timeScale={scale} />
            ) : (
              <ASCIIOceanField paused={paused} timeScale={scale} />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>

    </>
  );
}
