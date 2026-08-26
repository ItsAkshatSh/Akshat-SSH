/**
 * usePerformanceTier
 * Lightweight runtime detection of the host device's capability. Returns
 * one of 'high' | 'medium' | 'low' after the first client render. SSR
 * always yields 'high' so server output matches a capable client; the
 * effect runs once mounted and re-classifies as needed.
 *
 * Signals used:
 *   - `prefers-reduced-motion` — user opt-out (always demotes to low)
 *   - `navigator.hardwareConcurrency` — logical CPU cores
 *   - `navigator.deviceMemory` — advertised RAM in GB (Chrome-family)
 *   - `navigator.connection.saveData` / `effectiveType` — hint that the
 *     device is on a metered / slow link
 *   - Viewport width — narrow phones get a mild penalty
 *
 * The scoring is intentionally coarse. Anything running on 4 cores or
 * fewer, less than 4 GB, on 2G, with reduced motion requested, or on a
 * narrow phone falls to the "low" tier. Everything in between lands in
 * "medium". Modern desktops sit in "high".
 */
import { useEffect, useState } from 'react';

export default function usePerformanceTier() {
  const [tier, setTier] = useState('high');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = window.navigator || {};
    const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
    const memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8;
    const connection = nav.connection || {};
    const effType = connection.effectiveType || '';
    const saveData = connection.saveData === true;
    const slowConn = effType === '2g' || effType === 'slow-2g';
    const narrow = window.innerWidth < 640;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let result;
    if (prefersReduced || saveData || slowConn) {
      result = 'low';
    } else if (cores <= 4 || memory < 4 || (narrow && cores <= 6)) {
      result = 'low';
    } else if (cores < 8 || memory < 8 || narrow) {
      result = 'medium';
    } else {
      result = 'high';
    }
    setTier(result);

    // Re-check when reduced-motion or viewport width changes.
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (mq?.matches) setTier('low');
    };
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);

  return tier;
}
