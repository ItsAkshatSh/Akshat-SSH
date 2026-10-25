/**
 * BackgroundField
 * Owns the site's selectable living background.
 */
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const ASCIIOceanField = lazy(() => import('./ascii/ASCIIField'));
const SignalArchiveField = lazy(() => import('./signal/SignalArchiveField'));

export default function BackgroundField({ paused = false, theme = 'ocean' }) {
  return (
    <motion.div
      className="fixed inset-0 z-ocean pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <Suspense fallback={null}>
        {theme === 'signal'
          ? <SignalArchiveField paused={paused} />
          : <ASCIIOceanField paused={paused} />}
      </Suspense>
    </motion.div>
  );
}
