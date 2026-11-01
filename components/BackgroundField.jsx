/**
 * BackgroundField
 * Owns the site's living Ocean background.
 */
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

const ASCIIOceanField = lazy(() => import('./ascii/ASCIIField'));

export default function BackgroundField({ paused = false }) {
  return (
    <motion.div
      className="fixed inset-0 z-ocean pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <Suspense fallback={null}>
        <ASCIIOceanField paused={paused} />
      </Suspense>
    </motion.div>
  );
}
